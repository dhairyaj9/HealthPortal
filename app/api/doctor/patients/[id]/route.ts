export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'doctor') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const patient = await prisma.patientProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      medicalHistory: { include: { doctor: { include: { user: { select: { name: true } } } } }, orderBy: { diagnosedDate: 'desc' } },
      medications: { include: { prescribingDoctor: { include: { user: { select: { name: true } } } } }, orderBy: { startDate: 'desc' } },
      allergies: true,
      labResults: { include: { doctor: { include: { user: { select: { name: true } } } } }, orderBy: { orderedDate: 'desc' } },
      prescriptions: { include: { doctor: { include: { user: { select: { name: true } } } } }, orderBy: { issuedDate: 'desc' } },
      medicalDocuments: { orderBy: { uploadedAt: 'desc' } },
      billingRecords: { orderBy: { dueDate: 'desc' } },
      appointmentsAsPatient: { include: { doctor: { include: { user: { select: { name: true } } } } }, orderBy: { dateTime: 'desc' } },
    },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patient)
}
