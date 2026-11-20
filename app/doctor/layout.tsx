import { requireDoctor } from '@/lib/auth-utils'
import { AppShell } from '@/components/layouts/app-shell'
import { DoctorSidebar } from '@/components/dashboard/doctor-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  await requireDoctor()
  return (
    <AppShell
      sidebar={<DoctorSidebar />}
      header={<DashboardHeader />}
    >
      {children}
    </AppShell>
  )
}
