// app/m/pro/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SignInSignUpMobile from '@/components/SignInSignUpMobile'
import ProFeaturesMobile from '@/components/ProFeaturesMobile'

export default function ProMobilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (session?.user) {
        const id = session.user.id
        localStorage.setItem('fake_user', JSON.stringify({ id }))
        setUserId(id)
      } else {
        const storedUser = localStorage.getItem('fake_user')
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            setUserId(parsed.id)
          } catch {
            setUserId(null)
          }
        }
      }

      setLoading(false)
    }

    init()
  }, [])

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  return (
    <main className="min-h-screen px-4 text-white bg-zinc-900 pb-20">
      {userId ? <ProFeaturesMobile userId={userId} /> : <SignInSignUpMobile />}
    </main>
  )
}
