'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import Link from 'next/link'

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications?limit=50').then(r => r.json()).then(d => { setNotifications(d?.notifications ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' })
    setNotifications(prev => prev?.map((n: any) => ({ ...(n ?? {}), isRead: true })) ?? [])
    toast.success('All marked as read')
  }

  if (loading) return <Skeleton className="h-48 w-full" />

  const hasUnread = notifications?.some((n: any) => !n?.isRead)

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay updated on your healthcare activity" actions={
        hasUnread ? <Button variant="outline" onClick={markAllRead}><Check className="mr-2 h-4 w-4" /> Mark all read</Button> : undefined
      } />
      <Stagger staggerDelay={0.03}>
        {(notifications?.length ?? 0) === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No notifications</CardContent></Card>
        ) : (
          notifications?.map((n: any) => (
            <StaggerItem key={n?.id}>
              <Card className={`transition-shadow hover:shadow-md ${!n?.isRead ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Bell className={`h-5 w-5 mt-0.5 ${!n?.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-sm">{n?.title ?? 'Notification'}</p>
                        <SafeDate date={n?.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' }} className="text-xs text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n?.message ?? ''}</p>
                      {n?.link && <Link href={n.link} className="text-xs text-primary hover:underline mt-1 inline-block">View details →</Link>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )) ?? null
        )}
      </Stagger>
    </div>
  )
}
