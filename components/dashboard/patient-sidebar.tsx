'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, User, Heart, Pill, AlertTriangle,
  Calendar, FlaskConical, FileText, FolderOpen,
  MessageSquare, CreditCard, Activity
} from 'lucide-react'

const navItems = [
  { href: '/patient', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patient/profile', label: 'My Profile', icon: User },
  { href: '/patient/medical-history', label: 'Medical History', icon: Heart },
  { href: '/patient/medications', label: 'Medications', icon: Pill },
  { href: '/patient/allergies', label: 'Allergies', icon: AlertTriangle },
  { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/patient/lab-results', label: 'Lab Results', icon: FlaskConical },
  { href: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/patient/documents', label: 'Documents', icon: FolderOpen },
  { href: '/patient/messages', label: 'Messages', icon: MessageSquare },
  { href: '/patient/billing', label: 'Billing', icon: CreditCard },
]

export function PatientSidebar() {
  const pathname = usePathname()

  return (
    <>
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <Activity className="h-7 w-7 text-primary" />
        <span className="font-display text-xl font-bold tracking-tight text-foreground">HealthPortal</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/patient' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
