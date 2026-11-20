export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json([])
  const results = await prisma.labResult.findMany({
    where: { doctorId: doctorProfile.id },
    include: { patient: { include: { user: { select: { name: true } } } } },
    orderBy: { orderedDate: 'desc' },
  })
  return NextResponse.json(results)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const result = await prisma.labResult.create({
    data: {
      patientId: body.patientId,
      doctorId: doctorProfile.id,
      testName: body.testName,
      resultValue: body.resultValue,
      unit: body.unit,
      referenceRange: body.referenceRange,
      status: body.status ?? 'pending',
      orderedDate: new Date(),
      resultDate: body.resultValue ? new Date() : null,
      notes: body.notes,
      fileUrl: body.cloud_storage_path,
      isPublic: body.isPublic ?? false,
    },
  })
  // Notify patient
  const patient = await prisma.patientProfile.findUnique({ where: { id: body.patientId }, include: { user: true } })
  if (patient) {
    await prisma.notification.create({
      data: { userId: patient.userId, title: 'New Lab Result', message: `${body.testName} results are available.`, type: 'lab', link: '/patient/lab-results' },
    })
  }
  return NextResponse.json(result, { status: 201 })
}
