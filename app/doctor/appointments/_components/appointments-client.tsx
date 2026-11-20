'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, Check, X, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DoctorAppointmentsClient() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [noteDialog, setNoteDialog] = useState<any>(null)
  const [notes, setNotes] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/doctor/appointments')
      setAppointments((await res.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const now = new Date()
  const upcoming = (appointments ?? []).filter((a: any) => new Date(a?.dateTime) >= now && a?.status !== 'cancelled' && a?.status !== 'completed')
  const past = (appointments ?? []).filter((a: any) => new Date(a?.dateTime) < now || a?.status === 'completed' || a?.status === 'cancelled')

  const handleAction = async (id: string, status: string, noteText?: string) => {
    try {
      await fetch(`/api/doctor/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: noteText }),
      })
      toast.success(`Appointment ${status}`)
      fetchData()
    } catch { toast.error('Error') }
  }

  const saveNotes = () => {
    if (noteDialog) { handleAction(noteDialog.id, noteDialog.status ?? 'confirmed', notes); setNoteDialog(null); setNotes('') }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>

  const renderAppointment = (apt: any) => (
    <StaggerItem key={apt?.id}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{apt?.patient?.user?.name ?? 'Patient'}</p>
              <p className="text-sm text-muted-foreground">{apt?.reason ?? 'Appointment'}</p>
              <SafeDate date={apt?.dateTime} options={{ dateStyle: 'long', timeStyle: 'short' }} className="text-xs text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{apt?.durationMinutes ?? 30} min • {apt?.type ?? 'in-person'}</p>
              {apt?.notes && <p className="text-xs italic mt-1">"{apt.notes}"</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant={apt?.status === 'confirmed' ? 'default' : apt?.status === 'cancelled' ? 'destructive' : 'outline'}>{apt?.status}</Badge>
              {apt?.status === 'scheduled' && (
                <>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleAction(apt.id, 'confirmed')} title="Confirm"><Check className="h-4 w-4 text-green-500" /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleAction(apt.id, 'cancelled')} title="Cancel"><X className="h-4 w-4 text-destructive" /></Button>
                </>
              )}
              <Button variant="ghost" size="icon-sm" onClick={() => { setNoteDialog(apt); setNotes(apt?.notes ?? '') }} title="Notes"><FileText className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </StaggerItem>
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Manage patient appointments" />
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
      <Dialog open={!!noteDialog} onOpenChange={() => setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Appointment Notes</DialogTitle></DialogHeader>
          <Textarea value={notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)} rows={4} placeholder="Add clinical notes..." />
          <Button onClick={saveNotes}>Save Notes</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
