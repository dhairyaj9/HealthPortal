'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Plus, Video, Building2, X } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function AppointmentsClient() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [bookForm, setBookForm] = useState({ doctorId: '', dateTime: '', type: 'in-person', reason: '' })
  const [booking, setBooking] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [aptRes, docRes] = await Promise.all([fetch('/api/patient/appointments'), fetch('/api/doctors')])
      setAppointments((await aptRes.json()) ?? [])
      setDoctors((await docRes.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const now = new Date()
  const upcoming = (appointments ?? []).filter((a: any) => new Date(a?.dateTime) >= now && a?.status !== 'cancelled')
  const past = (appointments ?? []).filter((a: any) => new Date(a?.dateTime) < now || a?.status === 'cancelled')

  const handleBook = async () => {
    if (!bookForm.doctorId || !bookForm.dateTime) { toast.error('Select a doctor and date/time'); return }
    setBooking(true)
    try {
      const res = await fetch('/api/patient/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm),
      })
      if (res.ok) { toast.success('Appointment booked!'); setOpen(false); fetchData() }
      else { const d = await res.json(); toast.error(d?.error ?? 'Failed') }
    } catch { toast.error('Error') } finally { setBooking(false) }
  }

  const handleCancel = async (id: string) => {
    try {
      await fetch(`/api/patient/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      toast.success('Appointment cancelled')
      fetchData()
    } catch { toast.error('Error') }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>

  const renderAppointment = (apt: any) => (
    <StaggerItem key={apt?.id}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {apt?.type === 'telehealth' ? <Video className="h-5 w-5 text-primary mt-0.5" /> : <Building2 className="h-5 w-5 text-primary mt-0.5" />}
              <div>
                <p className="font-semibold">{apt?.doctor?.user?.name ?? 'Doctor'}</p>
                <p className="text-sm text-muted-foreground">{apt?.reason ?? 'Appointment'}</p>
                <SafeDate date={apt?.dateTime} options={{ dateStyle: 'long', timeStyle: 'short' }} className="text-xs text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{apt?.durationMinutes ?? 30} min • {apt?.type ?? 'in-person'}</p>
                {apt?.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{apt.notes}"</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[apt?.status ?? ''] ?? statusColors.scheduled}`}>{apt?.status ?? 'scheduled'}</span>
              {(apt?.status === 'scheduled' || apt?.status === 'confirmed') && new Date(apt?.dateTime) > now && (
                <Button variant="ghost" size="icon-sm" onClick={() => handleCancel(apt.id)}><X className="h-4 w-4 text-destructive" /></Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </StaggerItem>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Manage your upcoming and past appointments" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Book Appointment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Book New Appointment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={bookForm.doctorId} onValueChange={(v: string) => setBookForm({...bookForm, doctorId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctors?.map((d: any) => (
                      <SelectItem key={d?.id} value={d?.id}>{d?.user?.name} — {d?.specialty}</SelectItem>
                    )) ?? null}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={bookForm.dateTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookForm({...bookForm, dateTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={bookForm.type} onValueChange={(v: string) => setBookForm({...bookForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="telehealth">Telehealth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea value={bookForm.reason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBookForm({...bookForm, reason: e.target.value})} placeholder="Describe the reason for visit" />
              </div>
              <Button className="w-full" onClick={handleBook} disabled={booking}>{booking ? 'Booking...' : 'Confirm Booking'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <Tabs defaultValue="upcoming">
        <TabsList><TabsTrigger value="upcoming">Upcoming ({upcoming?.length ?? 0})</TabsTrigger><TabsTrigger value="past">Past ({past?.length ?? 0})</TabsTrigger></TabsList>
        <TabsContent value="upcoming" className="space-y-3 mt-4">
          <Stagger staggerDelay={0.05}>
            {(upcoming?.length ?? 0) === 0 ? <Card><CardContent className="p-6 text-center text-muted-foreground">No upcoming appointments</CardContent></Card> : upcoming?.map(renderAppointment)}
          </Stagger>
        </TabsContent>
        <TabsContent value="past" className="space-y-3 mt-4">
          <Stagger staggerDelay={0.05}>
            {(past?.length ?? 0) === 0 ? <Card><CardContent className="p-6 text-center text-muted-foreground">No past appointments</CardContent></Card> : past?.map(renderAppointment)}
          </Stagger>
        </TabsContent>
      </Tabs>
    </div>
  )
}
