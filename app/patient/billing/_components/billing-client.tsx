'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate, SafeNumber } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function BillingClient() {
  const [billing, setBilling] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/patient/billing').then(r => r.json()).then(d => { setBilling(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const totalOutstanding = (billing ?? []).filter((b: any) => b?.status === 'pending' || b?.status === 'overdue').reduce((s: number, b: any) => s + (b?.amount ?? 0), 0)

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="View your billing history and pending charges" />
      <FadeIn>
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-amber-500/20 p-3"><DollarSign className="h-6 w-6 text-amber-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Outstanding Balance</p>
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-400"><SafeNumber value={totalOutstanding} currency="USD" /></p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Billing History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                    <TableHead className="hidden md:table-cell">Paid Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(billing?.length ?? 0) === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No billing records</TableCell></TableRow>
                  ) : (
                    billing?.map((b: any) => (
                      <TableRow key={b?.id}>
                        <TableCell className="font-medium">{b?.description ?? 'N/A'}</TableCell>
                        <TableCell><SafeNumber value={b?.amount ?? 0} currency="USD" /></TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b?.status ?? ''] ?? statusColors.pending}`}>{b?.status ?? 'pending'}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell"><SafeDate date={b?.dueDate} options={{ dateStyle: 'medium' }} /></TableCell>
                        <TableCell className="hidden md:table-cell">{b?.paidDate ? <SafeDate date={b.paidDate} options={{ dateStyle: 'medium' }} /> : '—'}</TableCell>
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
