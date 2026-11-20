export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json([])
  const appointments = await prisma.appointment.findMany({
    where: { patientId: profile.id },
    include: { doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { dateTime: 'desc' },
  })
  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  const body = await request.json()
  const { doctorId, dateTime, type, reason } = body
  if (!doctorId || !dateTime) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Simple conflict check
  const dt = new Date(dateTime)
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId,
      dateTime: { gte: new Date(dt.getTime() - 30 * 60000), lt: new Date(dt.getTime() + 30 * 60000) },
      status: { in: ['scheduled', 'confirmed'] },
    },
  })
  if (existing) return NextResponse.json({ error: 'Time slot not available' }, { status: 409 })

  const appointment = await prisma.appointment.create({
    data: { patientId: profile.id, doctorId, dateTime: dt, type: type ?? 'in-person', reason, status: 'scheduled' },
  })

  // Create notifications
  const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId }, include: { user: true } })
  if (doctor) {
    await prisma.notification.create({
      data: { userId: doctor.userId, title: 'New Appointment', message: `${session.user.name} booked an appointment.`, type: 'appointment', link: '/doctor/appointments' },
    })
  }
  await prisma.notification.create({
    data: { userId: session.user.id, title: 'Appointment Booked', message: `Your appointment has been scheduled.`, type: 'appointment', link: '/patient/appointments' },
  })

  return NextResponse.json(appointment, { status: 201 })
}
