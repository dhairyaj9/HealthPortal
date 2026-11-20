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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FlaskConical, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function DoctorLabResultsClient() {
  const [results, setResults] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ patientId: '', testName: '', resultValue: '', unit: '', referenceRange: '', status: 'pending', notes: '' })

  const fetchData = useCallback(async () => {
    try {
      const [labRes, patRes] = await Promise.all([fetch('/api/doctor/lab-results'), fetch('/api/doctor/patients')])
      setResults((await labRes.json()) ?? [])
      setPatients((await patRes.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async () => {
    if (!form.patientId || !form.testName) { toast.error('Patient and test name required'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/doctor/lab-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success('Lab result added'); setOpen(false); setForm({ patientId: '', testName: '', resultValue: '', unit: '', referenceRange: '', status: 'pending', notes: '' }); fetchData() }
    } catch { toast.error('Error') } finally { setSubmitting(false) }
  }

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Results" description="Manage laboratory results for your patients" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Lab Result</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Lab Result</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Patient</Label>
                <Select value={form.patientId} onValueChange={(v: string) => setForm({...form, patientId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients?.map((p: any) => <SelectItem key={p?.id} value={p?.id}>{p?.user?.name}</SelectItem>) ?? null}</SelectContent>
                </Select></div>
              <div><Label>Test Name</Label><Input value={form.testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, testName: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Result Value</Label><Input value={form.resultValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, resultValue: e.target.value})} /></div>
                <div><Label>Unit</Label><Input value={form.unit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, unit: e.target.value})} /></div>
              </div>
              <div><Label>Reference Range</Label><Input value={form.referenceRange} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, referenceRange: e.target.value})} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v: string) => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, notes: e.target.value})} /></div>
              <Button className="w-full" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving...' : 'Save Lab Result'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <FadeIn>
        <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table>
          <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Test</TableHead><TableHead>Result</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {(results?.length ?? 0) === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No lab results</TableCell></TableRow> :
              results?.map((r: any) => (
                <TableRow key={r?.id}>
                  <TableCell>{r?.patient?.user?.name ?? 'N/A'}</TableCell>
                  <TableCell className="font-medium">{r?.testName}</TableCell>
                  <TableCell className="font-mono text-sm">{r?.resultValue ?? 'Pending'}{r?.unit ? ` ${r.unit}` : ''}</TableCell>
                  <TableCell><Badge variant={r?.status === 'normal' ? 'outline' : 'destructive'}>{r?.status}</Badge></TableCell>
                  <TableCell><SafeDate date={r?.resultDate ?? r?.orderedDate} options={{ dateStyle: 'short' }} /></TableCell>
                </TableRow>
              )) ?? null}
          </TableBody>
        </Table></div></CardContent></Card>
      </FadeIn>
    </div>
  )
}
