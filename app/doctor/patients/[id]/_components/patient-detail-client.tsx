'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Pill, AlertTriangle, FlaskConical, FileText, Calendar, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/layouts/page-header'
import { FadeIn } from '@/components/ui/animate'
import { SafeDate, SafeNumber } from '@/components/safe-format'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface Props { patientId: string }

export function PatientDetailClient({ patientId }: Props) {
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/doctor/patients/${patientId}`).then(r => r.json()).then(d => { setPatient(d); setLoading(false) }).catch(() => setLoading(false))
  }, [patientId])

  if (loading) return <Skeleton className="h-96 w-full" />
  if (!patient) return <Card><CardContent className="p-6 text-center">Patient not found</CardContent></Card>

  return (
    <div className="space-y-6">
      <Link href="/doctor/patients"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients</Button></Link>
      <FadeIn>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold">{patient?.user?.name ?? 'Patient'}</h2>
                <p className="text-muted-foreground text-sm">{patient?.user?.email ?? ''}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>DOB: <SafeDate date={patient?.dob} options={{ dateStyle: 'medium' }} /></span>
                  <span>Blood: <Badge variant="outline">{patient?.bloodType ?? 'N/A'}</Badge></span>
                  <span>{patient?.gender ?? ''}</span>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Insurance:</span> {patient?.insuranceProvider ?? 'N/A'}</p>
                <p className="font-mono text-xs">{patient?.insurancePolicyNumber ?? ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
      <Tabs defaultValue="history">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="prescriptions">Rx</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="space-y-3 mt-4">
          {(patient?.medicalHistory?.length ?? 0) === 0 ? <p className="text-muted-foreground text-sm">No records</p> :
            patient.medicalHistory.map((h: any) => (
              <Card key={h?.id}><CardContent className="p-3 flex items-center justify-between">
                <div><p className="font-medium">{h?.condition}</p><p className="text-xs text-muted-foreground"><SafeDate date={h?.diagnosedDate} options={{ dateStyle: 'medium' }} /> • {h?.doctor?.user?.name ?? 'N/A'}</p>{h?.notes && <p className="text-xs text-muted-foreground mt-1">{h.notes}</p>}</div>
                <Badge variant={h?.status === 'active' ? 'default' : 'secondary'}>{h?.status}</Badge>
              </CardContent></Card>
            ))}
        </TabsContent>
        <TabsContent value="medications" className="space-y-3 mt-4">
          {(patient?.medications?.length ?? 0) === 0 ? <p className="text-muted-foreground text-sm">No medications</p> :
            patient.medications.map((m: any) => (
              <Card key={m?.id}><CardContent className="p-3 flex items-center justify-between">
                <div><p className="font-medium">{m?.name} {m?.dosage}</p><p className="text-xs text-muted-foreground">{m?.frequency} • {m?.prescribingDoctor?.user?.name ?? ''}</p></div>
                <Badge variant={m?.status === 'active' ? 'default' : 'secondary'}>{m?.status}</Badge>
              </CardContent></Card>
            ))}
        </TabsContent>
        <TabsContent value="allergies" className="space-y-3 mt-4">
          {(patient?.allergies?.length ?? 0) === 0 ? <p className="text-muted-foreground text-sm">No allergies</p> :
            patient.allergies.map((a: any) => (
              <Card key={a?.id}><CardContent className="p-3 flex items-center justify-between">
                <div><p className="font-medium">{a?.allergen}</p><p className="text-xs text-muted-foreground">{a?.reaction}</p></div>
                <Badge variant={a?.severity === 'severe' ? 'destructive' : 'outline'}>{a?.severity}</Badge>
              </CardContent></Card>
            ))}
        </TabsContent>
        <TabsContent value="labs" className="mt-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead>Test</TableHead><TableHead>Result</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {(patient?.labResults?.length ?? 0) === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No results</TableCell></TableRow> :
                patient.labResults.map((l: any) => (
                  <TableRow key={l?.id}>
                    <TableCell className="font-medium">{l?.testName}</TableCell>
                    <TableCell className="font-mono text-sm">{l?.resultValue ?? 'Pending'}</TableCell>
                    <TableCell><Badge variant={l?.status === 'normal' ? 'outline' : 'destructive'}>{l?.status}</Badge></TableCell>
                    <TableCell><SafeDate date={l?.resultDate ?? l?.orderedDate} options={{ dateStyle: 'short' }} /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table></div></CardContent></Card>
        </TabsContent>
        <TabsContent value="prescriptions" className="space-y-3 mt-4">
          {(patient?.prescriptions?.length ?? 0) === 0 ? <p className="text-muted-foreground text-sm">No prescriptions</p> :
            patient.prescriptions.map((rx: any) => (
              <Card key={rx?.id}><CardContent className="p-3 flex items-center justify-between">
                <div><p className="font-medium">{rx?.medicationName}</p><p className="text-xs text-muted-foreground">{rx?.dosage} • {rx?.instructions}</p><p className="text-xs text-muted-foreground">By {rx?.doctor?.user?.name ?? 'N/A'} • <SafeDate date={rx?.issuedDate} options={{ dateStyle: 'short' }} /></p></div>
                <Badge variant={rx?.status === 'active' ? 'default' : 'secondary'}>{rx?.status}</Badge>
              </CardContent></Card>
            ))}
        </TabsContent>
        <TabsContent value="appointments" className="space-y-3 mt-4">
          {(patient?.appointmentsAsPatient?.length ?? 0) === 0 ? <p className="text-muted-foreground text-sm">No appointments</p> :
            patient.appointmentsAsPatient.map((a: any) => (
              <Card key={a?.id}><CardContent className="p-3 flex items-center justify-between">
                <div><p className="font-medium">{a?.reason ?? 'Appointment'}</p><SafeDate date={a?.dateTime} options={{ dateStyle: 'medium', timeStyle: 'short' }} className="text-xs text-muted-foreground" /><p className="text-xs text-muted-foreground">{a?.type} • {a?.durationMinutes}min • {a?.doctor?.user?.name ?? ''}</p></div>
                <Badge variant={a?.status === 'completed' ? 'secondary' : a?.status === 'cancelled' ? 'destructive' : 'default'}>{a?.status}</Badge>
              </CardContent></Card>
            ))}
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead></TableRow></TableHeader>
            <TableBody>
              {(patient?.billingRecords?.length ?? 0) === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No records</TableCell></TableRow> :
                patient.billingRecords.map((b: any) => (
                  <TableRow key={b?.id}>
                    <TableCell>{b?.description}</TableCell>
                    <TableCell><SafeNumber value={b?.amount ?? 0} currency="USD" /></TableCell>
                    <TableCell><Badge variant={b?.status === 'paid' ? 'outline' : 'default'}>{b?.status}</Badge></TableCell>
                    <TableCell><SafeDate date={b?.dueDate} options={{ dateStyle: 'short' }} /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table></div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
