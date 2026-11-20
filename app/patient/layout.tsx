import { requirePatient } from '@/lib/auth-utils'
import { AppShell } from '@/components/layouts/app-shell'
import { PatientSidebar } from '@/components/dashboard/patient-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  await requirePatient()
  return (
    <AppShell
      sidebar={<PatientSidebar />}
      header={<DashboardHeader />}
    >
      {children}
    </AppShell>
  )
}
