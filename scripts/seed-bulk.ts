// Bulk synthetic data generator. Deterministic (seeded PRNG) and idempotent (upserts with fixed IDs).
import type { PrismaClient } from '@prisma/client'
import { BULK_DOCTORS, BULK_PATIENTS, CONDITIONS, ALLERGENS, INSURERS, BLOOD, STREETS, CITIES, VISIT_REASONS, VISIT_NOTES, pick, between, type Rng, type Condition } from './seed-bulk-data'

function mulberry32(a: number): Rng {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FEES: Record<string, number> = { sarah: 240, james: 145, raman: 220, torres: 230, novak: 190, kim: 260, adeyemi: 235 }
const LAB_FEES = [85, 110, 125, 140, 165, 95]

const at = (days: number, hour: number) => {
  const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, hour % 2 ? 30 : 0, 0, 0); return d
}

export async function seedBulk(
  prisma: PrismaClient,
  hashes: { doctor: string; patient: string },
  base: { sarah: { userId: string; profileId: string }; james: { userId: string; profileId: string } },
) {
  // --- Doctors ---
  const docs: Record<string, { userId: string; profileId: string; name: string }> = {
    sarah: { ...base.sarah, name: 'Dr. Sarah Mitchell' },
    james: { ...base.james, name: 'Dr. James Okonkwo' },
  }
  for (const d of BULK_DOCTORS) {
    const u = await prisma.user.upsert({ where: { email: d.email }, update: {}, create: { email: d.email, passwordHash: hashes.doctor, name: d.name, role: 'doctor' } })
    const p = await prisma.doctorProfile.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id, specialty: d.specialty, licenseNumber: d.license, phone: d.phone, bio: d.bio } })
    docs[d.key] = { userId: u.id, profileId: p.id, name: d.name }
  }

  // --- Patients ---
  for (let i = 0; i < BULK_PATIENTS.length; i++) {
    const r = mulberry32(1000 + i * 7919)
    const [first, last, gender, dob, ecName] = BULK_PATIENTS[i]
    const name = `${first} ${last}`
    const email = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@healthportal.com'
    const k = `bk-${i}`
    const phone = `(555) ${510 + i}-${String(1000 + Math.floor(r() * 8999))}`

    const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, passwordHash: hashes.patient, name, role: 'patient' } })
    const ins = pick(r, INSURERS)
    const prof = await prisma.patientProfile.upsert({
      where: { userId: user.id }, update: {},
      create: {
        userId: user.id, dob: new Date(dob), gender, bloodType: pick(r, BLOOD), phone,
        address: `${100 + Math.floor(r() * 9800)} ${pick(r, STREETS)}, ${pick(r, CITIES)}`,
        emergencyContactName: `${ecName} ${last}`, emergencyContactPhone: `(555) ${610 + i}-${String(1000 + Math.floor(r() * 8999))}`,
        insuranceProvider: ins,
        insurancePolicyNumber: `${ins.replace(/[^A-Z]/g, '').slice(0, 4) || 'INS'}-${2022 + (i % 4)}-${first[0]}${last[0]}-${1000 + Math.floor(r() * 8999)}`,
        insuranceGroupNumber: `GRP-${10000 + Math.floor(r() * 89999)}`,
      },
    })
    const pid = prof.id

    // Pick 2-4 distinct conditions
    const nCond = 2 + Math.floor(r() * 3)
    const conds: Condition[] = []
    while (conds.length < nCond) { const c = pick(r, CONDITIONS); if (!conds.includes(c)) conds.push(c) }

    const careTeam = Array.from(new Set(['james', ...conds.map((c) => c.doctor)]))

    // Medical history, medications, prescriptions
    for (let c = 0; c < conds.length; c++) {
      const cond = conds[c]
      const resolved = cond.name === 'Iron-deficiency Anemia' || r() < 0.1
      const diagYear = 2008 + Math.floor(r() * 16)
      const diag = new Date(`${diagYear}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-${String(1 + Math.floor(r() * 27)).padStart(2, '0')}`)
      const doc = docs[cond.doctor]
      await prisma.medicalHistory.upsert({ where: { id: `${k}-mh-${c}` }, update: {}, create: { id: `${k}-mh-${c}`, patientId: pid, condition: cond.name, diagnosedDate: diag, status: resolved ? 'resolved' : 'active', notes: cond.notes, doctorId: doc.profileId } })
      if (cond.med) {
        const m = cond.med
        const end = resolved ? new Date(diag.getTime() + 1000 * 60 * 60 * 24 * 180) : null
        await prisma.medication.upsert({ where: { id: `${k}-med-${c}` }, update: {}, create: { id: `${k}-med-${c}`, patientId: pid, name: m.name, dosage: m.dosage, frequency: m.frequency, startDate: diag, endDate: end, status: resolved ? 'discontinued' : 'active', prescribingDoctorId: doc.profileId } })
        const issued = resolved ? diag : at(-Math.floor(20 + r() * 150), 9)
        const expiry = resolved ? end! : new Date(issued.getTime() + 1000 * 60 * 60 * 24 * 365)
        await prisma.prescription.upsert({ where: { id: `${k}-rx-${c}` }, update: {}, create: { id: `${k}-rx-${c}`, patientId: pid, doctorId: doc.profileId, medicationName: `${m.name} ${m.dosage}`, dosage: `${m.dosage} - ${m.frequency}`, instructions: m.instructions, issuedDate: issued, expiryDate: expiry, status: resolved ? 'expired' : 'active' } })
      }
    }

    // Allergies (0-3)
    const nAl = Math.floor(r() * 4)
    const used = new Set<string>()
    for (let a = 0; a < nAl; a++) {
      const [allergen, reaction, severity] = pick(r, ALLERGENS)
      if (used.has(allergen)) continue
      used.add(allergen)
      await prisma.allergy.upsert({ where: { id: `${k}-al-${a}` }, update: {}, create: { id: `${k}-al-${a}`, patientId: pid, allergen, reaction, severity } })
    }

    // Appointments + billing
    let apptN = 0, billN = 0, pendingTotal = 0, overdue = 0
    const completed: { date: Date; doctor: string }[] = []
    let nextUpcoming: { date: Date; doctor: string } | null = null
    for (const dk of careTeam) {
      const doc = docs[dk]
      const nPast = 1 + Math.floor(r() * 3)
      for (let v = 0; v < nPast; v++) {
        const days = -Math.floor(10 + r() * 340)
        const date = at(days, 8 + Math.floor(r() * 9))
        const roll = r()
        const status = roll < 0.12 ? 'cancelled' : 'completed'
        const id = `${k}-apt-${apptN++}`
        await prisma.appointment.upsert({ where: { id }, update: {}, create: { id, patientId: pid, doctorId: doc.profileId, dateTime: date, durationMinutes: pick(r, [20, 30, 30, 45]), type: r() < 0.3 ? 'telehealth' : 'in-person', status, reason: pick(r, VISIT_REASONS), notes: status === 'completed' ? pick(r, VISIT_NOTES) : roll < 0.05 ? 'Patient did not attend (no-show).' : 'Cancelled by patient.' } })
        if (status !== 'completed') continue
        completed.push({ date, doctor: dk })
        const ago = -days
        const bStatus = ago > 60 ? 'paid' : ago > 30 ? (r() < 0.35 ? 'overdue' : 'paid') : 'pending'
        const amount = FEES[dk] + pick(r, [0, 0, 25, 50])
        if (bStatus === 'pending') pendingTotal += amount
        if (bStatus === 'overdue') overdue++
        const due = new Date(date.getTime() + 1000 * 60 * 60 * 24 * 30)
        await prisma.billing.upsert({ where: { id: `${k}-bill-${billN}` }, update: {}, create: { id: `${k}-bill-${billN++}`, patientId: pid, doctorId: doc.profileId, appointmentId: id, description: `Office visit - ${doc.name}`, amount, status: bStatus, dueDate: due, paidDate: bStatus === 'paid' ? new Date(due.getTime() - 1000 * 60 * 60 * 24 * Math.floor(1 + r() * 20)) : null } })
      }
      if (r() < 0.75) {
        const date = at(Math.floor(r() * 60), 8 + Math.floor(r() * 9))
        const id = `${k}-apt-${apptN++}`
        await prisma.appointment.upsert({ where: { id }, update: {}, create: { id, patientId: pid, doctorId: doc.profileId, dateTime: date, durationMinutes: 30, type: r() < 0.4 ? 'telehealth' : 'in-person', status: r() < 0.6 ? 'confirmed' : 'scheduled', reason: pick(r, VISIT_REASONS) } })
        if (!nextUpcoming || date < nextUpcoming.date) nextUpcoming = { date, doctor: dk }
      }
    }

    // Lab results (from condition panels, 1-2 draws each) + lab bills
    let labN = 0
    for (const cond of conds) {
      if (!cond.lab) continue
      const draws = 1 + Math.floor(r() * 2)
      for (let d = 0; d < draws; d++) {
        const lab = cond.lab(r)
        const ordered = at(-Math.floor(5 + r() * 300), 8)
        const pending = d === 0 && r() < 0.12
        const id = `${k}-lab-${labN++}`
        await prisma.labResult.upsert({ where: { id }, update: {}, create: { id, patientId: pid, doctorId: docs[cond.doctor].profileId, testName: lab.testName, resultValue: pending ? null : lab.value, unit: lab.unit, referenceRange: lab.ref, status: pending ? 'pending' : lab.status, orderedDate: ordered, resultDate: pending ? null : new Date(ordered.getTime() + 1000 * 60 * 60 * 24 * 2), notes: pending ? 'Sample received; awaiting result.' : lab.notes } })
        if (!pending) {
          const ago = (Date.now() - ordered.getTime()) / 86400000
          const amount = pick(r, LAB_FEES)
          const bStatus = ago > 45 ? 'paid' : 'pending'
          if (bStatus === 'pending') pendingTotal += amount
          await prisma.billing.upsert({ where: { id: `${k}-bill-${billN}` }, update: {}, create: { id: `${k}-bill-${billN++}`, patientId: pid, doctorId: docs[cond.doctor].profileId, description: `Lab work - ${lab.testName}`, amount, status: bStatus, dueDate: new Date(ordered.getTime() + 1000 * 60 * 60 * 24 * 30), paidDate: bStatus === 'paid' ? new Date(ordered.getTime() + 1000 * 60 * 60 * 24 * 21) : null } })
        }
      }
    }

    // Documents
    let docN = 0
    for (const cond of conds) {
      if (!cond.doc) continue
      const id = `${k}-doc-${docN++}`
      await prisma.medicalDocument.upsert({ where: { id }, update: {}, create: { id, patientId: pid, doctorId: docs[cond.doctor].profileId, title: cond.doc.title, type: cond.doc.type, uploadedAt: at(-Math.floor(10 + r() * 200), 11), notes: cond.doc.notes } })
    }
    const insId = `${k}-doc-ins`
    await prisma.medicalDocument.upsert({ where: { id: insId }, update: {}, create: { id: insId, patientId: pid, title: `${ins} Insurance Card`, type: 'insurance', uploadedAt: at(-Math.floor(100 + r() * 200), 14), notes: 'Front and back of insurance card on file.' } })

    // Messages
    let msgN = 0
    for (const cond of conds) {
      if (!cond.question) continue
      const doc = docs[cond.doctor]
      const [subject, body, reply] = cond.question
      const sentDays = Math.floor(1 + r() * 25)
      const qid = `${k}-msg-${msgN++}`
      const replied = r() < 0.65
      await prisma.message.upsert({ where: { id: qid }, update: {}, create: { id: qid, senderId: user.id, receiverId: doc.userId, subject, body: `Dr. ${doc.name.split(' ').slice(-1)[0]}, ${body}`, isRead: replied, createdAt: at(-sentDays, 19) } })
      if (replied) {
        const rid = `${k}-msg-${msgN++}`
        await prisma.message.upsert({ where: { id: rid }, update: {}, create: { id: rid, senderId: doc.userId, receiverId: user.id, subject: `Re: ${subject}`, body: `Hi ${first}, ${reply}`, isRead: r() < 0.5, createdAt: at(-sentDays + 1, 10), parentId: qid } })
        await prisma.notification.upsert({ where: { id: `${k}-n-msg-${msgN}` }, update: {}, create: { id: `${k}-n-msg-${msgN}`, userId: user.id, title: 'New Message', message: `${doc.name} replied to "${subject}".`, type: 'message', isRead: false, link: '/patient/messages', createdAt: at(-sentDays + 1, 10) } })
      } else {
        await prisma.notification.upsert({ where: { id: `${k}-n-dmsg-${msgN}` }, update: {}, create: { id: `${k}-n-dmsg-${msgN}`, userId: doc.userId, title: 'New Message', message: `${name} sent you a message: "${subject}".`, type: 'message', isRead: false, link: '/doctor/messages', createdAt: at(-sentDays, 19) } })
      }
    }

    // Patient notifications
    if (nextUpcoming) {
      await prisma.notification.upsert({ where: { id: `${k}-n-apt` }, update: {}, create: { id: `${k}-n-apt`, userId: user.id, title: 'Upcoming Appointment', message: `Your appointment with ${docs[nextUpcoming.doctor].name} is on ${nextUpcoming.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}.`, type: 'appointment', isRead: false, link: '/patient/appointments', createdAt: at(-2, 9) } })
    }
    if (labN > 0) {
      await prisma.notification.upsert({ where: { id: `${k}-n-lab` }, update: {}, create: { id: `${k}-n-lab`, userId: user.id, title: 'Lab Results Available', message: 'New lab results have been posted to your record.', type: 'lab', isRead: r() < 0.5, link: '/patient/lab-results', createdAt: at(-Math.floor(3 + r() * 20), 15) } })
    }
    if (pendingTotal > 0 || overdue > 0) {
      await prisma.notification.upsert({ where: { id: `${k}-n-bill` }, update: {}, create: { id: `${k}-n-bill`, userId: user.id, title: overdue > 0 ? 'Overdue Balance' : 'New Statement', message: overdue > 0 ? `You have ${overdue} overdue bill(s). Please review your billing page.` : `You have a pending balance of $${pendingTotal.toFixed(2)}.`, type: 'billing', isRead: false, link: '/patient/billing', createdAt: at(-4, 8) } })
    }
    if (completed.length > 0 && conds.some((c) => c.med)) {
      await prisma.notification.upsert({ where: { id: `${k}-n-rx` }, update: {}, create: { id: `${k}-n-rx`, userId: user.id, title: 'Prescription Renewed', message: 'Your prescription has been renewed and is ready for pickup.', type: 'prescription', isRead: true, link: '/patient/prescriptions', createdAt: at(-Math.floor(10 + r() * 40), 12) } })
    }
  }
}
