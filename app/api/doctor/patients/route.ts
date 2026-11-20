export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json([])

  // Get patients who have appointments with this doctor
  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctorProfile.id },
    select: { patientId: true },
    distinct: ['patientId'],
  })
  const patientIds = appointments.map((a: any) => a.patientId)

  const patients = await prisma.patientProfile.findMany({
    where: { id: { in: patientIds } },
    include: {
      user: { select: { name: true, email: true } },
      medicalHistory: { select: { condition: true, status: true } },
      medications: { where: { status: 'active' }, select: { name: true } },
      allergies: { select: { allergen: true, severity: true } },
      appointmentsAsPatient: {
        where: { doctorId: doctorProfile.id },
        orderBy: { dateTime: 'desc' },
        take: 1,
        select: { dateTime: true, status: true },
      },
    },
  })
  return NextResponse.json(patients)
}
