export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') ?? '20')
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  })
  return NextResponse.json({ notifications, unreadCount })
}
