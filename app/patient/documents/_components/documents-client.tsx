'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FolderOpen, Upload, Download, FileIcon } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function DocumentsClient() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'report', file: null as File | null })

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/patient/documents')
      setDocuments((await res.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title) { toast.error('Title and file required'); return }
    setUploading(true)
    try {
      const presignRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: uploadForm.file.name, contentType: uploadForm.file.type, isPublic: false }),
      })
      const { uploadUrl, cloud_storage_path } = await presignRes.json()
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': uploadForm.file.type }, body: uploadForm.file })
      await fetch('/api/patient/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: uploadForm.title, type: uploadForm.type, cloud_storage_path, isPublic: false }),
      })
      toast.success('Document uploaded')
      setOpen(false)
      setUploadForm({ title: '', type: 'report', file: null })
      fetchDocs()
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
      a.href = url
      a.download = doc?.title ?? 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch { toast.error('Download failed') }
  }

  if (loading) return <Skeleton className="h-48 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Upload and manage your medical documents" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Upload className="mr-2 h-4 w-4" /> Upload Document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Medical Document</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={uploadForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadForm({...uploadForm, title: e.target.value})} placeholder="Document title" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={uploadForm.type} onValueChange={(v: string) => setUploadForm({...uploadForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadForm({...uploadForm, file: e.target.files?.[0] ?? null})} />
              </div>
              <Button className="w-full" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <Stagger staggerDelay={0.05}>
        {(documents?.length ?? 0) === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No documents uploaded yet</CardContent></Card>
        ) : (
          documents?.map((doc: any) => (
            <StaggerItem key={doc?.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{doc?.title ?? 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{doc?.type ?? 'document'} • Uploaded <SafeDate date={doc?.uploadedAt} options={{ dateStyle: 'medium' }} /></p>
                        {doc?.doctor?.user?.name && <p className="text-xs text-muted-foreground">By {doc.doctor.user.name}</p>}
                      </div>
                    </div>
                    {doc?.fileUrl && (
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                        <Download className="mr-1 h-3 w-3" /> Download
                      </Button>
                    )}
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
