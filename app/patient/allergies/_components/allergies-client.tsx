'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { Stagger, StaggerItem } from '@/components/ui/animate'
import { Skeleton } from '@/components/ui/skeleton'

const severityColors: Record<string, string> = {
  severe: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  mild: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

export function AllergiesClient() {
  const [allergies, setAllergies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patient/allergies').then(r => r.json()).then(d => { setAllergies(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Allergies" description="Known allergens and reactions" />
      <Stagger staggerDelay={0.05}>
        {(allergies?.length ?? 0) === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No allergies on record</CardContent></Card>
        ) : (
          allergies?.map((al: any) => (
            <StaggerItem key={al?.id}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${al?.severity === 'severe' ? 'text-red-500' : al?.severity === 'moderate' ? 'text-amber-500' : 'text-green-500'}`} />
                      <div>
                        <p className="font-semibold">{al?.allergen ?? 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">Reaction: {al?.reaction ?? 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColors[al?.severity ?? ''] ?? severityColors.moderate}`}>
                      {al?.severity ?? 'moderate'}
                    </span>
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
