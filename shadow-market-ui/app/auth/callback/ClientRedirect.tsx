'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ClientRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const type = searchParams.get('type')

    if (type === 'recovery') {
      router.replace('/reset-password')
    } else {
      router.replace('/pro')
    }
  }, [searchParams, router])

  return <p className="text-white text-lg">🔄 Redirecting...</p>
}
