// app/m/pro/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SignInSignUpMobile from '@/components/SignInSignUpMobile'
import ProFeaturesMobile from '@/components/ProFeaturesMobile'

export default function ProMobilePage() {
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      setSignedIn(!!session?.user)
      setLoading(false)
    }

    init()
  }, [])

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  return (
    <main className="min-h-screen px-4 text-white bg-zinc-900 pb-20">
      {signedIn ? <ProFeaturesMobile /> : <SignInSignUpMobile />}
    </main>
  )
}
