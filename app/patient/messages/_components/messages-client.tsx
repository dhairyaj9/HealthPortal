'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// tabs replaced with custom button toggle
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Mail, Reply } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function MessagesClient() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('inbox')
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [composeForm, setComposeForm] = useState({ receiverId: '', subject: '', messageBody: '' })
  const [replyTo, setReplyTo] = useState<any>(null)
  const [replyBody, setReplyBody] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const [msgRes, docRes] = await Promise.all([fetch(`/api/messages?tab=${tab}`), fetch('/api/doctors')])
      setMessages((await msgRes.json())?.messages ?? [])
      setDoctors((await docRes.json()) ?? [])
    } catch {} finally { setLoading(false) }
  }, [tab])

  useEffect(() => { setLoading(true); fetchMessages() }, [fetchMessages])

  const handleSend = async () => {
    if (!composeForm.receiverId || !composeForm.messageBody) { toast.error('Select doctor and write message'); return }
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeForm),
      })
      if (res.ok) { toast.success('Message sent'); setOpen(false); setComposeForm({ receiverId: '', subject: '', messageBody: '' }); fetchMessages() }
      else toast.error('Failed to send')
    } catch { toast.error('Error') } finally { setSending(false) }
  }

  const handleReply = async (parentId: string) => {
    if (!replyBody) return
    setSending(true)
    const parentMsg = messages?.find((m: any) => m?.id === parentId)
    const receiverId = parentMsg?.senderId === session?.user?.id ? parentMsg?.receiverId : parentMsg?.senderId
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, subject: `Re: ${parentMsg?.subject ?? ''}`, messageBody: replyBody, parentId }),
      })
      if (res.ok) { toast.success('Reply sent'); setReplyBody(''); setReplyTo(null); fetchMessages() }
    } catch { toast.error('Error') } finally { setSending(false) }
  }

  const markRead = async (id: string) => {
    try { await fetch(`/api/messages/${id}/read`, { method: 'POST' }) } catch {}
  }

  if (loading) return <Skeleton className="h-48 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Communicate with your healthcare providers" actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Mail className="mr-2 h-4 w-4" /> New Message</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Compose Message</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={composeForm.receiverId} onValueChange={(v: string) => setComposeForm({...composeForm, receiverId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                  <SelectContent>{doctors?.map((d: any) => <SelectItem key={d?.user?.id} value={d?.user?.id}>{d?.user?.name}</SelectItem>) ?? null}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={composeForm.subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComposeForm({...composeForm, subject: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea rows={4} value={composeForm.messageBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComposeForm({...composeForm, messageBody: e.target.value})} />
              </div>
              <Button className="w-full" onClick={handleSend} disabled={sending}><Send className="mr-2 h-4 w-4" /> {sending ? 'Sending...' : 'Send Message'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <div className="flex gap-2 mb-4">
        <Button variant={tab === 'inbox' ? 'default' : 'outline'} size="sm" onClick={() => { setTab('inbox'); setExpandedId(null) }}>Inbox</Button>
        <Button variant={tab === 'sent' ? 'default' : 'outline'} size="sm" onClick={() => { setTab('sent'); setExpandedId(null) }}>Sent</Button>
      </div>
      {tab === 'inbox' && (
        <div className="space-y-3">
          {(messages?.length ?? 0) === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No messages</CardContent></Card>
          ) : (
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
                          <p className="text-xs text-muted-foreground">
                            {tab === 'inbox' ? `From: ${msg?.sender?.name ?? 'Unknown'}` : `To: ${msg?.receiver?.name ?? 'Unknown'}`}
                          </p>
                        </div>
                        <SafeDate date={msg?.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' }} className="text-xs text-muted-foreground" />
                      </div>
                      {expandedId === msg?.id && (
                        <div className="mt-3 space-y-3">
                          <div className="rounded-lg bg-muted/50 p-3 text-sm">{msg?.body ?? ''}</div>
                          {(msg?.replies?.length ?? 0) > 0 && (
                            <div className="ml-4 space-y-2 border-l-2 border-primary/20 pl-3">
                              {msg.replies.map((r: any) => (
                                <div key={r?.id} className="rounded-lg bg-muted/30 p-2 text-sm">
                                  <p className="text-xs font-medium text-muted-foreground">{r?.sender?.name ?? 'Unknown'} • <SafeDate date={r?.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' }} /></p>
                                  <p className="mt-1">{r?.body ?? ''}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input placeholder="Type a reply..." value={replyTo === msg?.id ? replyBody : ''}
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
          )}
        </div>
      )}
      {tab === 'sent' && (
        <div className="space-y-3">
          {(messages?.length ?? 0) === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No sent messages</CardContent></Card>
          ) : (
            <Stagger staggerDelay={0.03}>
              {messages?.map((msg: any) => (
                <StaggerItem key={msg?.id}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => { setExpandedId(expandedId === msg?.id ? null : msg?.id) }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{msg?.subject ?? '(No subject)'}</p>
                          <p className="text-xs text-muted-foreground">To: {msg?.receiver?.name ?? 'Unknown'}</p>
                        </div>
                        <SafeDate date={msg?.createdAt} options={{ dateStyle: 'short', timeStyle: 'short' }} className="text-xs text-muted-foreground" />
                      </div>
                      {expandedId === msg?.id && (
                        <div className="mt-3"><div className="rounded-lg bg-muted/50 p-3 text-sm">{msg?.body ?? ''}</div></div>
                      )}
                    </CardContent>
                  </Card>
                </StaggerItem>
              )) ?? null}
            </Stagger>
          )}
        </div>
      )}
    </div>
  )
}
