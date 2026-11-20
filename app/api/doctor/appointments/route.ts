export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session.user.id } })
  if (!doctorProfile) return NextResponse.json([])
  const appointments = await prisma.appointment.findMany({
    where: { doctorId: doctorProfile.id },
    include: { patient: { include: { user: { select: { name: true } } } } },
    orderBy: { dateTime: 'desc' },
  })
  return NextResponse.json(appointments)
}
