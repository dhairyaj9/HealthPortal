import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return session
}

export async function requirePatient() {
  const session = await requireAuth()
  if (session.user?.role !== 'patient') {
    redirect('/login')
  }
  return session
}

export async function requireDoctor() {
  const session = await requireAuth()
  if (session.user?.role !== 'doctor') {
    redirect('/login')
  }
  return session
}
