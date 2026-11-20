export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json([])
  const documents = await prisma.medicalDocument.findMany({
    where: { patientId: profile.id },
    include: { doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { uploadedAt: 'desc' },
  })
  return NextResponse.json(documents)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  const body = await request.json()
  const doc = await prisma.medicalDocument.create({
    data: {
      patientId: profile.id,
      title: body.title,
      type: body.type,
      fileUrl: body.cloud_storage_path,
      isPublic: body.isPublic ?? false,
      notes: body.notes,
    },
  })
  return NextResponse.json(doc, { status: 201 })
}
