'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Mail, Reply } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function DoctorMessagesClient() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('inbox')
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [composeForm, setComposeForm] = useState({ receiverId: '', subject: '', messageBody: '' })
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const [msgRes, patRes] = await Promise.all([fetch(`/api/messages?tab=${tab}`), fetch('/api/doctor/patients')])
      setMessages((await msgRes.json())?.messages ?? [])
      setPatients((await patRes.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [tab])

  useEffect(() => { setLoading(true); fetchMessages() }, [fetchMessages])

  const handleSend = async () => {
    if (!composeForm.receiverId || !composeForm.messageBody) { toast.error('Select patient and write message'); return }
    setSending(true)
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(composeForm) })
      if (res.ok) { toast.success('Message sent'); setOpen(false); setComposeForm({ receiverId: '', subject: '', messageBody: '' }); fetchMessages() }
    } catch { toast.error('Error') } finally { setSending(false) }
  }

  const handleReply = async (parentId: string) => {
    if (!replyBody) return
    setSending(true)
    const parentMsg = messages?.find((m: any) => m?.id === parentId)
    const receiverId = parentMsg?.senderId === session?.user?.id ? parentMsg?.receiverId : parentMsg?.senderId
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receiverId, subject: `Re: ${parentMsg?.subject ?? ''}`, messageBody: replyBody, parentId }) })
      if (res.ok) { toast.success('Reply sent'); setReplyBody(''); setReplyTo(null); fetchMessages() }
    } catch { toast.error('Error') } finally { setSending(false) }
  }

  const markRead = async (id: string) => { try { await fetch(`/api/messages/${id}/read`, { method: 'POST' }) } catch {} }

  if (loading) return <Skeleton className="h-48 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Communicate with your patients" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Mail className="mr-2 h-4 w-4" /> New Message</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Message Patient</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>To</Label>
                <Select value={composeForm.receiverId} onValueChange={(v: string) => setComposeForm({...composeForm, receiverId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>{patients?.map((p: any) => <SelectItem key={p?.userId} value={p?.userId}>{p?.user?.name}</SelectItem>) ?? null}</SelectContent>
                </Select></div>
              <div><Label>Subject</Label><Input value={composeForm.subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComposeForm({...composeForm, subject: e.target.value})} /></div>
              <div><Label>Message</Label><Textarea rows={4} value={composeForm.messageBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComposeForm({...composeForm, messageBody: e.target.value})} /></div>
              <Button className="w-full" onClick={handleSend} disabled={sending}><Send className="mr-2 h-4 w-4" /> {sending ? 'Sending...' : 'Send'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="inbox">Inbox</TabsTrigger><TabsTrigger value="sent">Sent</TabsTrigger></TabsList>
        <TabsContent value={tab} className="space-y-3 mt-4">
          {(messages?.length ?? 0) === 0 ? <Card><CardContent className="p-6 text-center text-muted-foreground">No messages</CardContent></Card> :
            <Stagger staggerDelay={0.03}>
              {messages?.map((msg: any) => (
                <StaggerItem key={msg?.id}>
                  <Card className={`cursor-pointer transition-shadow hover:shadow-md ${!msg?.isRead && tab === 'inbox' ? 'border-primary/30 bg-primary/5' : ''}`}
                    onClick={() => { setExpandedId(expandedId === msg?.id ? null : msg?.id); if (!msg?.isRead && tab === 'inbox') markRead(msg?.id) }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{msg?.subject ?? '(No subject)'}</p>
                            {!msg?.isRead && tab === 'inbox' && <Badge className="text-[10px]">New</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{tab === 'inbox' ? `From: ${msg?.sender?.name}` : `To: ${msg?.receiver?.name}`}</p>
                        </div>
                        <SafeDate date={msg?.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' }} className="text-xs text-muted-foreground" />
                      </div>
                      {expandedId === msg?.id && (
                        <div className="mt-3 space-y-3">
                          <div className="rounded-lg bg-muted/50 p-3 text-sm">{msg?.body}</div>
                          {(msg?.replies?.length ?? 0) > 0 && (
                            <div className="ml-4 space-y-2 border-l-2 border-primary/20 pl-3">
                              {msg.replies.map((r: any) => (
                                <div key={r?.id} className="rounded-lg bg-muted/30 p-2 text-sm">
                                  <p className="text-xs font-medium text-muted-foreground">{r?.sender?.name} • <SafeDate date={r?.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' }} /></p>
                                  <p className="mt-1">{r?.body}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input placeholder="Reply..." value={replyTo === msg?.id ? replyBody : ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setReplyTo(msg?.id); setReplyBody(e.target.value) }}
                              onClick={(e: React.MouseEvent) => e.stopPropagation()} />
                            <Button size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReply(msg?.id) }} disabled={sending || !replyBody || replyTo !== msg?.id}>
                              <Reply className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </StaggerItem>
              )) ?? null}
            </Stagger>
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
