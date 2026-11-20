import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      patientProfileId: string | null
      doctorProfileId: string | null
    }
  }

  interface User {
    role: string
    patientProfileId: string | null
    doctorProfileId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    patientProfileId: string | null
    doctorProfileId: string | null
  }
}
