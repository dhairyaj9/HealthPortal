'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pill } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'

export function MedicationsClient() {
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patient/medications').then(r => r.json()).then(d => { setMedications(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Medications" description="Current and past prescribed medications" />
      <Stagger staggerDelay={0.05}>
        {(medications?.length ?? 0) === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No medications on record</CardContent></Card>
        ) : (
          medications?.map((med: any) => (
            <StaggerItem key={med?.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Pill className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold">{med?.name ?? 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{med?.dosage ?? ''} — {med?.frequency ?? ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">Prescribed by {med?.prescribingDoctor?.user?.name ?? 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Started: <SafeDate date={med?.startDate} options={{ dateStyle: 'medium' }} /></p>
                      </div>
                    </div>
                    <Badge variant={med?.status === 'active' ? 'default' : 'secondary'}>{med?.status ?? 'unknown'}</Badge>
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
