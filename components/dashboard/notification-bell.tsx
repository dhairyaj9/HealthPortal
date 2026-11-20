'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'
import { SafeDate } from '@/components/safe-format'

interface NotifItem {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link: string | null
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<NotifItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch('/api/notifications?limit=5')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data?.notifications ?? [])
        setUnreadCount(data?.unreadCount ?? 0)
      }
    } catch {}
  }, [session?.user])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', { method: 'POST' })
      setUnreadCount(0)
      setNotifications((prev) => prev?.map((n: NotifItem) => ({ ...(n ?? {}), isRead: true })) ?? [])
    } catch {}
  }

  const basePath = session?.user?.role === 'doctor' ? '/doctor' : '/patient'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {(notifications?.length ?? 0) === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            notifications?.map((n: NotifItem) => (
              <div key={n?.id} className={`p-3 border-b last:border-0 ${!n?.isRead ? 'bg-accent/50' : ''}`}>
                <p className="text-sm font-medium">{n?.title ?? ''}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n?.message ?? ''}</p>
                <SafeDate date={n?.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' }} className="text-[10px] text-muted-foreground mt-1 block" />
              </div>
            )) ?? null
          )}
        </div>
        <div className="border-t p-2">
          <Link href={`${basePath}/notifications`}>
            <Button variant="ghost" size="sm" className="w-full text-xs">View all notifications</Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
