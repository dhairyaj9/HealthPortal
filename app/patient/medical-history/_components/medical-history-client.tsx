'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'

export function MedicalHistoryClient() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/patient/medical-history').then(r => r.json()).then(d => { setHistory(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Medical History" description="Your diagnosed conditions and health records" />
      <Stagger staggerDelay={0.05}>
        {(history?.length ?? 0) === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No medical history records</CardContent></Card>
        ) : (
          history?.map((item: any) => (
            <StaggerItem key={item?.id}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setExpanded(expanded === item?.id ? null : item?.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{item?.condition ?? 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">Diagnosed: <SafeDate date={item?.diagnosedDate} options={{ dateStyle: 'medium' }} /></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item?.status === 'active' ? 'default' : 'secondary'}>{item?.status ?? 'unknown'}</Badge>
                      {expanded === item?.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                  {expanded === item?.id && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm space-y-2">
                      <p><span className="font-medium">Doctor:</span> {item?.doctor?.user?.name ?? 'N/A'}</p>
                      {item?.notes && <p><span className="font-medium">Notes:</span> {item.notes}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          )) ?? null
        )}
      </Stagger>
    </div>
  )
}
