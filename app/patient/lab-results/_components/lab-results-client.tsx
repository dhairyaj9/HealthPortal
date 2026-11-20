'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FlaskConical } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'

const statusStyles: Record<string, string> = {
  normal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  abnormal: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

export function LabResultsClient() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patient/lab-results').then(r => r.json()).then(d => { setResults(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Results" description="View your laboratory test results and reports" />
      <FadeIn>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="hidden md:table-cell">Reference Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Ordered By</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(results?.length ?? 0) === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No lab results</TableCell></TableRow>
                  ) : (
                    results?.map((r: any) => (
                      <TableRow key={r?.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 text-primary" />
                            {r?.testName ?? 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r?.resultValue ?? 'Pending'}{r?.unit ? ` ${r.unit}` : ''}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{r?.referenceRange ?? 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[r?.status ?? ''] ?? statusStyles.pending}`}>
                            {r?.status ?? 'pending'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{r?.doctor?.user?.name ?? 'N/A'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <SafeDate date={r?.resultDate ?? r?.orderedDate} options={{ dateStyle: 'medium' }} className="text-sm" />
                        </TableCell>
                      </TableRow>
                    )) ?? null
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
