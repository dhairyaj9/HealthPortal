import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DoctorDashboardClient } from './_components/doctor-dashboard-client'

export default async function DoctorDashboard() {
  const session = await auth()
  const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: session?.user?.id ?? '' } })
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 86400000)

  const todayAppointments = await prisma.appointment.findMany({
    where: { doctorId: doctorProfile?.id ?? '', dateTime: { gte: startOfDay, lt: endOfDay } },
    include: { patient: { include: { user: { select: { name: true } } } } },
    orderBy: { dateTime: 'asc' },
  })

  const totalPatients = await prisma.appointment.findMany({
    where: { doctorId: doctorProfile?.id ?? '' },
    select: { patientId: true },
    distinct: ['patientId'],
  })

  const pendingLabs = await prisma.labResult.count({
    where: { doctorId: doctorProfile?.id ?? '', status: 'pending' },
  })

  const unreadMessages = await prisma.message.count({
    where: { receiverId: session?.user?.id ?? '', isRead: false },
  })

  return (
    <DoctorDashboardClient
      doctorName={session?.user?.name ?? 'Doctor'}
      todayAppointments={JSON.parse(JSON.stringify(todayAppointments))}
      patientCount={totalPatients?.length ?? 0}
      pendingLabCount={pendingLabs}
      unreadMessages={unreadMessages}
    />
  )
}
