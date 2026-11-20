import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SignupForm } from './_components/signup-form'
import { AuthLayout } from '@/components/layouts/auth-layout'
import Link from 'next/link'

export default async function SignupPage() {
  const session = await auth()
  if (session?.user) {
    if (session.user.role === 'doctor') redirect('/doctor')
    redirect('/patient')
  }

  return (
    <AuthLayout title="Create Your Account" description="Join HealthPortal to manage your healthcare">
      <SignupForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
