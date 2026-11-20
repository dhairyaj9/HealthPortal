'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { SafeDate } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export function DoctorPatientsClient() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/doctor/patients').then(r => r.json()).then(d => { setPatients(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>

  return (
    <div className="space-y-6">
      <PageHeader title="My Patients" description={`${patients?.length ?? 0} patients under your care`} />
      <Stagger staggerDelay={0.05}>
        {(patients?.length ?? 0) === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No patients assigned</CardContent></Card>
        ) : (
          patients?.map((p: any) => (
            <StaggerItem key={p?.id}>
              <Link href={`/doctor/patients/${p?.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{p?.user?.name ?? 'Patient'}</p>
                          <p className="text-xs text-muted-foreground">{p?.user?.email ?? ''}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {p?.medicalHistory?.slice(0, 3)?.map((h: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{h?.condition ?? ''}</Badge>
                            )) ?? null}
                            {(p?.allergies?.length ?? 0) > 0 && (
                              <Badge variant="destructive" className="text-[10px]">{p.allergies.length} allergi{p.allergies.length === 1 ? 'y' : 'es'}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p?.appointmentsAsPatient?.[0] && (
                          <span className="text-xs text-muted-foreground hidden sm:block">Last visit: <SafeDate date={p.appointmentsAsPatient[0].dateTime} options={{ dateStyle: 'short' }} /></span>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          )) ?? null
        )}
      </Stagger>
    </div>
  )
}
