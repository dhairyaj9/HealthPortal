export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true, createdAt: true } } },
  })
  return NextResponse.json(profile)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'patient') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const updated = await prisma.patientProfile.update({
    where: { userId: session.user.id },
    data: {
      phone: body.phone,
      address: body.address,
      emergencyContactName: body.emergencyContactName,
      emergencyContactPhone: body.emergencyContactPhone,
      gender: body.gender,
    },
  })
  if (body.name) {
    await prisma.user.update({ where: { id: session.user.id }, data: { name: body.name } })
  }
  return NextResponse.json(updated)
}
