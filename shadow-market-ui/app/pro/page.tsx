'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SignInSignUp from '@/components/SignInSignUp'
import ProFeatures from '@/components/ProFeatures'
import SEOHead from '@/components/SEOHead'


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
    <>
      <SEOHead
        title="SurfRider Pro – Custom AI Startup Signals"
        description="Get custom Reddit insights and GPT-generated startup ideas. SurfRider Pro gives founders premium tools for trend scraping and early-stage discovery."
        keywords="custom startup ideas, GPT startup generator, Reddit trend scraper, founder tools AI, startup research, SurfRider Pro"
        url="https://surfrider.io/pro"
        image="https://surfrider.io/og.png"
      />
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-MWV2EHMNBG"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-MWV2EHMNBG');
</script>
      <main className="min-h-screen px-4 sm:px-6 max-w-6xl mx-auto text-white">
        {userId ? <ProFeatures /> : <SignInSignUp />}
      </main>
    </>
  )
}
