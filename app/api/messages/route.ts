export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const tab = url.searchParams.get('tab') ?? 'inbox'
  const where = tab === 'sent' ? { senderId: session.user.id } : { receiverId: session.user.id }
  const messages = await prisma.message.findMany({
    where: { ...where, parentId: null },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
      replies: {
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  const unreadCount = await prisma.message.count({
    where: { receiverId: session.user.id, isRead: false },
  })
  return NextResponse.json({ messages, unreadCount })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { receiverId, subject, messageBody, parentId } = body
  if (!receiverId || !messageBody) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  if (receiverId === session.user.id) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  const [senderUser, receiverUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, name: true } }),
    prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, role: true, name: true } }),
  ])

  if (!senderUser || !receiverUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (
    (senderUser.role !== 'patient' || receiverUser.role !== 'doctor') &&
    (senderUser.role !== 'doctor' || receiverUser.role !== 'patient')
  ) {
    return NextResponse.json({ error: 'Messages are only permitted between patients and providers' }, { status: 403 })
  }

  const patientUserId = senderUser.role === 'patient' ? senderUser.id : receiverUser.id
  const doctorUserId = senderUser.role === 'doctor' ? senderUser.id : receiverUser.id

  const [patientProfile, doctorProfile] = await Promise.all([
    prisma.patientProfile.findUnique({ where: { userId: patientUserId } }),
    prisma.doctorProfile.findUnique({ where: { userId: doctorUserId } }),
  ])

  if (!patientProfile || !doctorProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const careRelationship =
    (await prisma.appointment.findFirst({
      where: { patientId: patientProfile.id, doctorId: doctorProfile.id },
      select: { id: true },
    })) ||
    (await prisma.medicalHistory.findFirst({
      where: { patientId: patientProfile.id, doctorId: doctorProfile.id },
      select: { id: true },
    })) ||
    (await prisma.prescription.findFirst({
      where: { patientId: patientProfile.id, doctorId: doctorProfile.id },
      select: { id: true },
    })) ||
    (await prisma.medication.findFirst({
      where: { patientId: patientProfile.id, prescribingDoctorId: doctorProfile.id },
      select: { id: true },
    })) ||
    (await prisma.labResult.findFirst({
      where: { patientId: patientProfile.id, doctorId: doctorProfile.id },
      select: { id: true },
    })) ||
    (await prisma.medicalDocument.findFirst({
      where: { patientId: patientProfile.id, doctorId: doctorProfile.id },
      select: { id: true },
    })) ||
    (await prisma.billing.findFirst({
      where: { patientId: patientProfile.id, doctorId: doctorProfile.id },
      select: { id: true },
    }))

  if (!careRelationship) {
    return NextResponse.json({ error: 'No clinical care relationship exists' }, { status: 403 })
  }

  if (parentId) {
    const parentMessage = await prisma.message.findUnique({
      where: { id: parentId },
    })
    if (!parentMessage) {
      return NextResponse.json({ error: 'Parent message not found' }, { status: 404 })
    }
    if (parentMessage.senderId !== session.user.id && parentMessage.receiverId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to reply to this thread' }, { status: 403 })
    }
    const expectedReceiverId =
      parentMessage.senderId === session.user.id ? parentMessage.receiverId : parentMessage.senderId
    if (receiverId !== expectedReceiverId) {
      return NextResponse.json({ error: 'Invalid receiver for thread' }, { status: 400 })
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      subject: subject ?? null,
      body: messageBody,
      parentId: parentId ?? null,
    },
  })

  await prisma.notification.create({
    data: {
      userId: receiverId,
      title: 'New Message',
      message: `${session.user.name || senderUser.name} sent you a message.`,
      type: 'message',
      link: senderUser.role === 'doctor' ? '/patient/messages' : '/doctor/messages',
    },
  })
  return NextResponse.json(message, { status: 201 })
}
