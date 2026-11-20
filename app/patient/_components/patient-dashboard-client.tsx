'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MessageSquare, CreditCard, FlaskConical, Clock } from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import Link from 'next/link'

interface Props {
  userName: string
  upcomingAppointments: any[]
  unreadMessages: number
  pendingBills: any[]
  recentLabs: any[]
}

export function PatientDashboardClient({ userName, upcomingAppointments, unreadMessages, pendingBills, recentLabs }: Props) {
  const totalPendingAmount = (pendingBills ?? []).reduce((sum: number, b: any) => sum + (b?.amount ?? 0), 0)
  const nextAppt = upcomingAppointments?.[0]

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back, {userName?.split(' ')?.[0] ?? 'Patient'}</h1>
          {nextAppt ? (
            <p className="mt-1 text-muted-foreground">
              Your next appointment is with {nextAppt?.doctor?.user?.name ?? 'your doctor'} on{' '}
              <SafeDate date={nextAppt?.dateTime} options={{ dateStyle: 'long', timeStyle: 'short' }} className="font-medium text-foreground" />
            </p>
          ) : (
            <p className="mt-1 text-muted-foreground">No upcoming appointments scheduled.</p>
          )}
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SlideIn from="bottom" delay={0}>
          <Link href="/patient/appointments">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-primary/10 p-3"><Calendar className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">{upcomingAppointments?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Upcoming Appointments</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
        <SlideIn from="bottom" delay={0.05}>
          <Link href="/patient/messages">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-blue-500/10 p-3"><MessageSquare className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{unreadMessages}</p>
                  <p className="text-xs text-muted-foreground">Unread Messages</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
        <SlideIn from="bottom" delay={0.1}>
          <Link href="/patient/billing">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-amber-500/10 p-3"><CreditCard className="h-5 w-5 text-amber-500" /></div>
                <div>
                  <p className="text-2xl font-bold">${totalPendingAmount?.toFixed?.(0) ?? '0'}</p>
                  <p className="text-xs text-muted-foreground">Pending Balance</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
        <SlideIn from="bottom" delay={0.15}>
          <Link href="/patient/lab-results">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-emerald-500/10 p-3"><FlaskConical className="h-5 w-5 text-emerald-500" /></div>
                <div>
                  <p className="text-2xl font-bold">{recentLabs?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Recent Lab Results</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-primary" /> Upcoming Appointments</CardTitle></CardHeader>
            <CardContent>
              {(upcomingAppointments?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments?.map((apt: any) => (
                    <div key={apt?.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div>
                        <p className="font-medium text-sm">{apt?.doctor?.user?.name ?? 'Doctor'}</p>
                        <p className="text-xs text-muted-foreground">{apt?.reason ?? 'Appointment'}</p>
                        <SafeDate date={apt?.dateTime} options={{ dateStyle: 'medium', timeStyle: 'short' }} className="text-xs text-muted-foreground" />
                      </div>
                      <Badge variant={apt?.type === 'telehealth' ? 'secondary' : 'outline'}>{apt?.type ?? 'in-person'}</Badge>
                    </div>
                  )) ?? null}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.25}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FlaskConical className="h-5 w-5 text-primary" /> Recent Lab Results</CardTitle></CardHeader>
            <CardContent>
              {(recentLabs?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No recent lab results</p>
              ) : (
                <div className="space-y-3">
                  {recentLabs?.map((lab: any) => (
                    <div key={lab?.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div>
                        <p className="font-medium text-sm">{lab?.testName ?? 'Test'}</p>
                        <p className="text-xs text-muted-foreground">Ordered by {lab?.doctor?.user?.name ?? 'Doctor'}</p>
                      </div>
                      <Badge variant={lab?.status === 'normal' ? 'outline' : 'destructive'}>{lab?.status ?? 'pending'}</Badge>
                    </div>
                  )) ?? null}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
