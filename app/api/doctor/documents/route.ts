export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json([])
  const docs = await prisma.medicalDocument.findMany({
    where: { doctorId: doctorProfile.id },
    include: { patient: { include: { user: { select: { name: true } } } } },
    orderBy: { uploadedAt: 'desc' },
  })
  return NextResponse.json(docs)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const doc = await prisma.medicalDocument.create({
    data: {
      patientId: body.patientId,
      doctorId: doctorProfile.id,
      title: body.title,
      type: body.type,
      fileUrl: body.cloud_storage_path,
      isPublic: body.isPublic ?? false,
      notes: body.notes,
    },
  })
  return NextResponse.json(doc, { status: 201 })
}
