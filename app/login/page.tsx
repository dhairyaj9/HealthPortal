import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from './_components/login-form'
import { AuthLayout } from '@/components/layouts/auth-layout'
import Link from 'next/link'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    if (session.user.role === 'doctor') redirect('/doctor')
    redirect('/patient')
  }

  return (
    <AuthLayout title="Welcome to HealthPortal" description="Sign in to access your health dashboard">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
