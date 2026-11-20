export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generatePresignedUploadUrl } from '@/lib/s3'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { fileName, contentType, isPublic } = body
  if (!fileName || !contentType) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const result = await generatePresignedUploadUrl(fileName, contentType, isPublic ?? false)
  return NextResponse.json(result)
}
