'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get('type')

    if (type === 'recovery') {
      // Password reset flow
      router.replace('/reset-password')
    } else if (type === 'signup') {
      // Email confirmation after sign-up
      router.replace('/pro')
    } else if (type === 'magiclink' || type === 'email') {
      // Future: magic link login
      router.replace('/pro')
    } else {
      // Fallback — default to Pro
      router.replace('/pro')
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-white text-lg">🔄 Redirecting...</p>
    </main>
  )
}
