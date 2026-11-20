'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Phone, MapPin, Heart, Shield, Save } from 'lucide-react'
import { toast } from 'sonner'
import { SafeDate } from '@/components/safe-format'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn } from '@/components/ui/animate'
import { Skeleton } from '@/components/ui/skeleton'

export function PatientProfileClient() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', gender: '', emergencyContactName: '', emergencyContactPhone: '' })

  useEffect(() => {
    fetch('/api/patient/profile').then(r => r.json()).then(data => {
      setProfile(data)
      setForm({
        name: data?.user?.name ?? '',
        phone: data?.phone ?? '',
        address: data?.address ?? '',
        gender: data?.gender ?? '',
        emergencyContactName: data?.emergencyContactName ?? '',
        emergencyContactPhone: data?.emergencyContactPhone ?? '',
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) toast.success('Profile updated')
      else toast.error('Failed to update')
    } catch { toast.error('Error saving') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your personal and medical information" />
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    <SafeDate date={profile?.dob} options={{ dateStyle: 'long' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input value={form.gender} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, gender: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Badge variant="outline" className="text-base px-3 py-1">{profile?.bloodType ?? 'N/A'}</Badge>
              </div>
              <div className="space-y-2">
                <Label><Phone className="inline h-3 w-3 mr-1" />Phone</Label>
                <Input value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label><MapPin className="inline h-3 w-3 mr-1" />Address</Label>
                <Input value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, address: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
        <div className="space-y-6">
          <FadeIn delay={0.1}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Emergency Contact</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input value={form.emergencyContactName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, emergencyContactName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={form.emergencyContactPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, emergencyContactPhone: e.target.value})} />
                </div>
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={0.15}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Insurance Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Provider</span><span className="text-sm font-medium">{profile?.insuranceProvider ?? 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Policy #</span><span className="text-sm font-mono">{profile?.insurancePolicyNumber ?? 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Group #</span><span className="text-sm font-mono">{profile?.insuranceGroupNumber ?? 'N/A'}</span></div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
