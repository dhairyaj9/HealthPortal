'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, FlaskConical, MessageSquare, Clock } from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import Link from 'next/link'

interface Props {
  doctorName: string
  todayAppointments: any[]
  patientCount: number
  pendingLabCount: number
  unreadMessages: number
}

export function DoctorDashboardClient({ doctorName, todayAppointments, patientCount, pendingLabCount, unreadMessages }: Props) {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <h1 className="font-display text-2xl font-bold tracking-tight">Good day, {doctorName?.split(' ')?.[0] ?? 'Doctor'}</h1>
          <p className="mt-1 text-muted-foreground">You have {todayAppointments?.length ?? 0} appointment{(todayAppointments?.length ?? 0) === 1 ? '' : 's'} today.</p>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SlideIn from="bottom" delay={0}>
          <Link href="/doctor/appointments">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-primary/10 p-3"><Calendar className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold">{todayAppointments?.length ?? 0}</p><p className="text-xs text-muted-foreground">Today&apos;s Appointments</p></div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
        <SlideIn from="bottom" delay={0.05}>
          <Link href="/doctor/patients">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-emerald-500/10 p-3"><Users className="h-5 w-5 text-emerald-500" /></div>
                <div><p className="text-2xl font-bold">{patientCount}</p><p className="text-xs text-muted-foreground">Total Patients</p></div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
        <SlideIn from="bottom" delay={0.1}>
          <Link href="/doctor/lab-results">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-amber-500/10 p-3"><FlaskConical className="h-5 w-5 text-amber-500" /></div>
                <div><p className="text-2xl font-bold">{pendingLabCount}</p><p className="text-xs text-muted-foreground">Pending Lab Results</p></div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
        <SlideIn from="bottom" delay={0.15}>
          <Link href="/doctor/messages">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-blue-500/10 p-3"><MessageSquare className="h-5 w-5 text-blue-500" /></div>
                <div><p className="text-2xl font-bold">{unreadMessages}</p><p className="text-xs text-muted-foreground">Unread Messages</p></div>
              </CardContent>
            </Card>
          </Link>
        </SlideIn>
      </div>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5 text-primary" /> Today&apos;s Schedule</CardTitle></CardHeader>
          <CardContent>
            {(todayAppointments?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments?.map((apt: any) => (
                  <div key={apt?.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="font-medium text-sm">{apt?.patient?.user?.name ?? 'Patient'}</p>
                      <p className="text-xs text-muted-foreground">{apt?.reason ?? 'Appointment'}</p>
                      <SafeDate date={apt?.dateTime} options={{ timeStyle: 'short' }} className="text-xs text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={apt?.type === 'telehealth' ? 'secondary' : 'outline'}>{apt?.type ?? 'in-person'}</Badge>
                      <Badge variant={apt?.status === 'confirmed' ? 'default' : 'outline'}>{apt?.status ?? 'scheduled'}</Badge>
                    </div>
                  </div>
                )) ?? null}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
