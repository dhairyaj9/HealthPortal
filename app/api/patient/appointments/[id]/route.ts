export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  const appointment = await prisma.appointment.updateMany({
    where: { id, patientId: profile.id },
    data: { status: body.status },
  })
  return NextResponse.json({ success: true })
}
