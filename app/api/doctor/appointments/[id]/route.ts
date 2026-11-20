export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await request.json()
  await prisma.appointment.updateMany({
    where: { id, doctorId: doctorProfile.id },
    data: { status: body.status, notes: body.notes },
  })
  return NextResponse.json({ success: true })
}
