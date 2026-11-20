'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'

export function PrescriptionsClient() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patient/prescriptions').then(r => r.json()).then(d => { setPrescriptions(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Prescriptions" description="Active and past prescriptions from your doctors" />
      <Stagger staggerDelay={0.05}>
        {(prescriptions?.length ?? 0) === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No prescriptions</CardContent></Card>
        ) : (
          prescriptions?.map((rx: any) => (
            <StaggerItem key={rx?.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">{rx?.medicationName ?? 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{rx?.dosage ?? ''}</p>
                        <p className="text-sm text-muted-foreground">{rx?.instructions ?? ''}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">Issued: <SafeDate date={rx?.issuedDate} options={{ dateStyle: 'medium' }} /></span>
                          <span className="text-xs text-muted-foreground">Expires: <SafeDate date={rx?.expiryDate} options={{ dateStyle: 'medium' }} /></span>
                        </div>
                        <p className="text-xs text-muted-foreground">Prescribed by {rx?.doctor?.user?.name ?? 'N/A'}</p>
                      </div>
                    </div>
                    <Badge variant={rx?.status === 'active' ? 'default' : 'secondary'}>{rx?.status ?? 'unknown'}</Badge>
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
