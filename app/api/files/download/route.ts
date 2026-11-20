export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getFileUrl } from '@/lib/s3'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { cloud_storage_path, contentType, isPublic } = body
  if (!cloud_storage_path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  const url = await getFileUrl(cloud_storage_path, contentType ?? 'application/octet-stream', isPublic ?? false)
  return NextResponse.json({ url })
}
