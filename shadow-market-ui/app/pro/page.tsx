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
  
      // First: check Supabase auth session (for email confirm redirects)
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (session?.user) {
        const id = session.user.id
        localStorage.setItem('fake_user', JSON.stringify({ id }))
        setUserId(id)
      } else {
        // Fallback: check localStorage (manual login)
        const storedUser = localStorage.getItem('fake_user')
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            setUserId(parsed.id)
          } catch (err) {
            console.error('Failed to parse local user:', err)
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
    <main className="min-h-screen px-4 sm:px-6 max-w-6xl mx-auto text-white">
      {userId ? <ProFeatures userId={userId} /> : <SignInSignUp />}
    </main>
  )
}
