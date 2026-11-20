export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json([])
  const rxs = await prisma.prescription.findMany({
    where: { doctorId: doctorProfile.id },
    include: { patient: { include: { user: { select: { name: true } } } } },
    orderBy: { issuedDate: 'desc' },
  })
  return NextResponse.json(rxs)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const rx = await prisma.prescription.create({
    data: {
      patientId: body.patientId,
      doctorId: doctorProfile.id,
      medicationName: body.medicationName,
      dosage: body.dosage,
      instructions: body.instructions,
      issuedDate: new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      status: 'active',
    },
  })
  const patient = await prisma.patientProfile.findUnique({ where: { id: body.patientId }, include: { user: true } })
  if (patient) {
    await prisma.notification.create({
      data: { userId: patient.userId, title: 'New Prescription', message: `${body.medicationName} has been prescribed.`, type: 'prescription', link: '/patient/prescriptions' },
    })
  }
  return NextResponse.json(rx, { status: 201 })
}
