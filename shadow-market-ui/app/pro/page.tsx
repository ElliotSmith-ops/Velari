'use client'

import { useEffect, useState } from 'react'
import SignInSignUp from '@/components/SignInSignUp'
import ProFeatures from '@/components/ProFeatures'

export default function ProPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('fake_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUserId(parsed.id) // your Supabase "users" table should have an "id" field
      } catch (err) {
        console.error('Failed to parse user:', err)
        setUserId(null)
      }
    } else {
      setUserId(null)
    }

    setLoading(false)
  }, [])

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  return (
    <main className="min-h-screen px-4 sm:px-6 max-w-6xl mx-auto text-white">
      {userId ? <ProFeatures userId={userId} /> : <SignInSignUp />}
    </main>
  )
}
