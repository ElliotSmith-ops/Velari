'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Link from 'next/link'

const PRICE_OPTIONS = [
  {
    label: 'Starter Pack – 10 credits',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_10 || ''
  },
  {
    label: 'Builder Pack – 50 credits',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_50 || ''
  },
  {
    label: 'Founder Pack – Unlimited credits',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_UNLIMITED || ''
  }
]

export default function AccountPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  const [credits, setCredits] = useState(0)
  const [queries, setQueries] = useState<string[]>([])
  const [selectedQuery, setSelectedQuery] = useState('')
  const [showCreditOptions, setShowCreditOptions] = useState(false)

  useEffect(() => {
    const loadSessionData = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (!user) {
        router.push('/')
        return
      }

      setUserId(user.id)

      const { data: profile, error } = await supabase
        .from('users')
        .select('username, credits')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        toast.error('Error loading account')
        router.push('/')
        return
      }

      setUsername(profile.username)
      setCredits(profile.credits)
      fetchQueries(profile.username)
    }

    loadSessionData()
  }, [])

  const fetchQueries = async (username: string) => {
    const { data } = await supabase
      .from('custom_queries')
      .select('query')
      .eq('user_id', username)
      .order('created_at', { ascending: false })

    if (data) setQueries(data.map((q) => q.query))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (!confirm) return

    const res = await fetch('/api/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || 'Failed to delete account')
      return
    }

    await supabase.auth.signOut()
    router.push('/')
  }

  const handleBuyCredits = async (priceId: string) => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId })
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Error creating checkout session')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      <div className="max-w-md mx-auto sm:max-w-2xl sm:px-10">

        {/* Logo & Credits */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/pro">
            <Image
              src="/surfriderpro-icon.png"
              alt="SurfRider"
              width={40}
              height={40}
              className="cursor-pointer hover:scale-105 transition-transform"
            />
          </Link>
          <div className="bg-zinc-800 px-4 py-1.5 rounded-full text-sm text-zinc-300 shadow-inner sm:px-6 sm:py-2 sm:text-base">
            <span className="mr-1">Credits:</span>
            <span className="text-green-400 font-semibold">{credits}</span>
          </div>
        </div>

        {/* Username */}
        <div className="text-center mb-8">
          <h2 className="text-lg text-zinc-400 font-medium mb-1 sm:text-xl">User:</h2>
          <p className="text-xl text-white font-semibold tracking-wide sm:text-2xl">{username}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-5 sm:mt-10">
          <button
            onClick={() => setShowCreditOptions(true)}
            className="w-full py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white border border-white/10 hover:brightness-110 transition shadow"
          >
            Buy Credits
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-3 text-sm font-semibold rounded-xl bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 transition"
          >
            Sign Out
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-400/80 to-rose-500/80 text-white hover:brightness-110 transition shadow"
          >
            Delete Account
          </button>
        </div>

        {/* Credit Options Modal */}
        {showCreditOptions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-yellow-400 via-green-400 to-purple-600 shadow-xl">
              <div className="rounded-[14px] bg-zinc-900 px-8 py-6 text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Choose Your Pack 🏄</h2>
                <div className="space-y-3">
                  {PRICE_OPTIONS.filter((opt) => opt.priceId).map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setShowCreditOptions(false)
                        handleBuyCredits(opt.priceId!)
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-green-400 hover:brightness-110 transition text-sm font-semibold text-white shadow"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCreditOptions(false)}
                  className="mt-6 text-purple-300 text-sm underline hover:text-white"
                >
                  Nevermind
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
