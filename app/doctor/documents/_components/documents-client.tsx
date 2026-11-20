'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FolderOpen, Upload, FileIcon, Download } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function DoctorDocumentsClient() {
  const [documents, setDocuments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ patientId: '', title: '', type: 'report', file: null as File | null, notes: '' })

  const fetchData = useCallback(async () => {
    try {
      const [docRes, patRes] = await Promise.all([fetch('/api/doctor/documents'), fetch('/api/doctor/patients')])
      setDocuments((await docRes.json()) ?? [])
      setPatients((await patRes.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleUpload = async () => {
    if (!form.file || !form.title || !form.patientId) { toast.error('Patient, title and file required'); return }
    setUploading(true)
    try {
      const presignRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: form.file.name, contentType: form.file.type, isPublic: false }),
      })
      const { uploadUrl, cloud_storage_path } = await presignRes.json()
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': form.file.type }, body: form.file })
      await fetch('/api/doctor/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: form.patientId, title: form.title, type: form.type, cloud_storage_path, isPublic: false, notes: form.notes }),
      })
      toast.success('Document uploaded')
      setOpen(false)
      setForm({ patientId: '', title: '', type: 'report', file: null, notes: '' })
      fetchData()
    } catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const handleDownload = async (doc: any) => {
    try {
      const res = await fetch('/api/files/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloud_storage_path: doc?.fileUrl, isPublic: doc?.isPublic ?? false }),
      })
      const { url } = await res.json()
      const a = document.createElement('a')
      a.href = url; a.download = doc?.title ?? 'document'; document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } catch { toast.error('Download failed') }
  }

  if (loading) return <Skeleton className="h-48 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Upload and manage patient documents" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Upload className="mr-2 h-4 w-4" /> Upload Document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Document for Patient</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Patient</Label>
                <Select value={form.patientId} onValueChange={(v: string) => setForm({...form, patientId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients?.map((p: any) => <SelectItem key={p?.id} value={p?.id}>{p?.user?.name}</SelectItem>) ?? null}</SelectContent>
                </Select></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={(v: string) => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Report</SelectItem><SelectItem value="imaging">Imaging</SelectItem><SelectItem value="lab">Lab</SelectItem><SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select></div>
              <div><Label>File</Label><Input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, file: e.target.files?.[0] ?? null})} /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, notes: e.target.value})} /></div>
              <Button className="w-full" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <Stagger staggerDelay={0.05}>
        {(documents?.length ?? 0) === 0 ? <Card><CardContent className="p-6 text-center text-muted-foreground">No documents</CardContent></Card> :
          documents?.map((doc: any) => (
            <StaggerItem key={doc?.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{doc?.title}</p>
                      <p className="text-xs text-muted-foreground">Patient: {doc?.patient?.user?.name ?? 'N/A'} • <SafeDate date={doc?.uploadedAt} options={{ dateStyle: 'medium' }} /></p>
                    </div>
                  </div>
                  {doc?.fileUrl && <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}><Download className="mr-1 h-3 w-3" /> Download</Button>}
                </CardContent>
              </Card>
            </StaggerItem>
          )) ?? null}
      </Stagger>
    </div>
  )
}
