'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function DoctorPrescriptionsClient() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ patientId: '', medicationName: '', dosage: '', instructions: '', expiryDate: '' })

  const fetchData = useCallback(async () => {
    try {
      const [rxRes, patRes] = await Promise.all([fetch('/api/doctor/prescriptions'), fetch('/api/doctor/patients')])
      setPrescriptions((await rxRes.json()) ?? [])
      setPatients((await patRes.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!form.patientId || !form.medicationName) { toast.error('Patient and medication required'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/doctor/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast.success('Prescription created'); setOpen(false); setForm({ patientId: '', medicationName: '', dosage: '', instructions: '', expiryDate: '' }); fetchData() }
    } catch { toast.error('Error') } finally { setSubmitting(false) }
  }

  if (loading) return <Skeleton className="h-48 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Prescriptions" description="Write and manage patient prescriptions" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Prescription</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Write Prescription</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Patient</Label>
                <Select value={form.patientId} onValueChange={(v: string) => setForm({...form, patientId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients?.map((p: any) => <SelectItem key={p?.id} value={p?.id}>{p?.user?.name}</SelectItem>) ?? null}</SelectContent>
                </Select></div>
              <div><Label>Medication Name</Label><Input value={form.medicationName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, medicationName: e.target.value})} /></div>
              <div><Label>Dosage</Label><Input value={form.dosage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, dosage: e.target.value})} placeholder="e.g. 10mg twice daily" /></div>
              <div><Label>Instructions</Label><Textarea value={form.instructions} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, instructions: e.target.value})} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, expiryDate: e.target.value})} /></div>
              <Button className="w-full" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Issue Prescription'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <Stagger staggerDelay={0.05}>
        {(prescriptions?.length ?? 0) === 0 ? <Card><CardContent className="p-6 text-center text-muted-foreground">No prescriptions</CardContent></Card> :
          prescriptions?.map((rx: any) => (
            <StaggerItem key={rx?.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">{rx?.medicationName}</p>
                      <p className="text-sm text-muted-foreground">Patient: {rx?.patient?.user?.name ?? 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{rx?.dosage} • {rx?.instructions ?? ''}</p>
                      <SafeDate date={rx?.issuedDate} options={{ dateStyle: 'medium' }} className="text-xs text-muted-foreground" />
                    </div>
                  </div>
                  <Badge variant={rx?.status === 'active' ? 'default' : 'secondary'}>{rx?.status}</Badge>
                </CardContent>
              </Card>
            </StaggerItem>
          )) ?? null}
      </Stagger>
    </div>
  )
}
