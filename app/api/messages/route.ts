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
      message: `${session.user.name} sent you a message.`,
      type: 'message',
      link: session.user.role === 'doctor' ? '/patient/messages' : '/doctor/messages',
    },
  })
  return NextResponse.json(message, { status: 201 })
}
