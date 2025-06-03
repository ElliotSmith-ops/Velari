// app/m/pro/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SignInSignUpMobile from '@/components/SignInSignUpMobile'
import ProFeaturesMobile from '@/components/ProFeaturesMobile'
import SEOHead from '@/components/SEOHead'


export default function ProMobilePage() {
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData?.session?.user
        
        if (user) {
          localStorage.setItem('fake_user', JSON.stringify({ id: user.id }))
          setSignedIn(true)
        }
      setLoading(false)
    }

    init()
  }, [])

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  return (
    <>
    <SEOHead
        title="SurfRider Pro – Custom AI Startup Signals"
        description="Get custom insights and GPT-generated startup ideas. SurfRider Pro gives founders premium tools for trend scraping and early-stage discovery."
        keywords="custom startup ideas, GPT startup generator, Reddit trend scraper, founder tools AI, startup research, SurfRider Pro"
        url="https://surfrider.io/m/pro"
        image="https://surfrider.io/og.png"
    />

    <main className="min-h-screen px-4 text-white bg-zinc-900 pb-20">
      {signedIn ? <ProFeaturesMobile /> : <SignInSignUpMobile />}
    </main>
    </>
  )
}
