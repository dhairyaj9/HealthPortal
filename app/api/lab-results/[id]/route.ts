export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// =====================================================
// SECURITY-TEST-FLAW: IDOR VULNERABILITY (INTENTIONAL)
// This endpoint does not verify record ownership.
// A patient can access another patient's lab result
// by modifying the record ID in the URL.
// TO FIX: Add ownership check: where patient_id = session.user.patientProfileId
// REMOVE THIS COMMENT AND ADD THE FIX to patch this vulnerability.
// =====================================================
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  // SECURITY-TEST-FLAW: No ownership check - any authenticated user can access any lab result by ID
  const result = await prisma.labResult.findUnique({
    where: { id },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      patient: { include: { user: { select: { name: true } } } },
    },
  })

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(result)
}
