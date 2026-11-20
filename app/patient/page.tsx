import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PatientDashboardClient } from './_components/patient-dashboard-client'

export default async function PatientDashboard() {
  const session = await auth()
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: session?.user?.id ?? '' },
  })
  const now = new Date()
  const upcomingAppointments = await prisma.appointment.findMany({
    where: { patientId: profile?.id ?? '', dateTime: { gte: now }, status: { in: ['scheduled', 'confirmed'] } },
    include: { doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { dateTime: 'asc' },
    take: 3,
  })
  const unreadMessages = await prisma.message.count({ where: { receiverId: session?.user?.id ?? '', isRead: false } })
  const pendingBills = await prisma.billing.findMany({ where: { patientId: profile?.id ?? '', status: 'pending' } })
  const recentLabs = await prisma.labResult.findMany({
    where: { patientId: profile?.id ?? '' },
    include: { doctor: { include: { user: { select: { name: true } } } } },
    orderBy: { resultDate: 'desc' },
    take: 3,
  })

  return (
    <PatientDashboardClient
      userName={session?.user?.name ?? 'Patient'}
      upcomingAppointments={JSON.parse(JSON.stringify(upcomingAppointments))}
      unreadMessages={unreadMessages}
      pendingBills={JSON.parse(JSON.stringify(pendingBills))}
      recentLabs={JSON.parse(JSON.stringify(recentLabs))}
    />
  )
}
