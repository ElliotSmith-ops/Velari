'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import toast from 'react-hot-toast'

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
    const userData = localStorage.getItem('fake_user')
    if (!userData) return router.push('/')
    const parsed = JSON.parse(userData)
    setUsername(parsed.username)
    setUserId(parsed.user_id)
    fetchCredits(parsed.username)
    fetchQueries(parsed.username)
  }, [])

  const fetchCredits = async (username: string) => {
    const { data } = await supabase.from('users').select('credits').eq('username', username).single()
    if (data) setCredits(data.credits)
  }

  const fetchQueries = async (username: string) => {
    const { data } = await supabase
      .from('custom_queries')
      .select('query')
      .eq('user_id', username)
      .order('created_at', { ascending: false })
    if (data) setQueries(data.map((q) => q.query))
  }

  const handleSignOut = () => {
    localStorage.removeItem('fake_user')
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (!confirm) return
  
    const { error } = await fetch('/api/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
  
    if (error) {
      toast.error('Failed to delete account')
      return
    }
  
    await supabase.auth.signOut()
    localStorage.removeItem('fake_user')
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
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-8 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Image src="/surfrider-icon.png" alt="SurfRider" width={36} height={36} />
        <div className="text-sm text-zinc-300">
          <span className="mr-2 font-semibold">Credits:</span>
          <span className="text-white">{credits}</span>
        </div>
      </div>

      <h1 className="text-xl font-bold mb-4">👤 Welcome, {username}</h1>

      <div className="space-y-4">
        <Button onClick={() => setShowCreditOptions(true)} className="w-full">
          Buy Credits
        </Button>
        <Button onClick={handleSignOut} variant="secondary" className="w-full">
          Sign Out
        </Button>
        <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
          Delete Account
        </Button>
      </div>

      {queries.length > 0 && (
        <div className="mt-8">
          <label className="block text-sm mb-1 text-zinc-400">Your Past Queries</label>
          <select
            value={selectedQuery}
            onChange={(e) => setSelectedQuery(e.target.value)}
            className="w-full p-2 rounded-md bg-zinc-800 text-white border border-zinc-700"
          >
            <option value="">Select a query</option>
            {queries.map((q, i) => (
              <option key={i} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Modal for Buying Credits */}
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
    </main>
  )
}
