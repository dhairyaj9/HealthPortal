export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json([])
  const history = await prisma.medicalHistory.findMany({
    where: { patientId: profile.id },
    include: { doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { diagnosedDate: 'desc' },
  })
  return NextResponse.json(history)
}
