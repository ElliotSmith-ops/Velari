'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SignInSignUp from '@/components/SignInSignUp'
import ProFeatures from '@/components/ProFeatures'

export default function ProPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      if (window.innerWidth <= 768) {
        router.replace('/m/pro')
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (user) {
        setUserId(user.id)
      }

      setLoading(false)
    }

    init()
  }, [])

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  return (
    <main className="min-h-screen px-4 sm:px-6 max-w-6xl mx-auto text-white">
      {userId ? <ProFeatures /> : <SignInSignUp />}
    </main>
  )
}
