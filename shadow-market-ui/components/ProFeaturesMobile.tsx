'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import CopyButton from '@/components/CopyButton'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import ShareButton from '@/components/ShareButton'
import { ExternalLink } from 'lucide-react'



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PRICE_OPTIONS = [
  {
    label: 'Starter Pack – 10 credits',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_10
  },
  {
    label: 'Builder Pack – 50 credits',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_50
  },
  {
    label: 'Founder Pack – Unlimited credits',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_UNLIMITED
  }
]

export default function ProFeaturesMobile({ userId }: { userId: string }) {
  const [username, setUsername] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [scrapingMessage, setScrapingMessage] = useState<string | null>(null)
  const [userQueries, setUserQueries] = useState<string[]>([])
  const [selectedQuery, setSelectedQuery] = useState('')
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false)
  const [showCreditOptions, setShowCreditOptions] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username, credits')
        .eq('id', userId)
        .single()
      if (!error && data) {
        setUsername(data.username)
        setCredits(data.credits)
      }
    }

    const fetchUserQueries = async () => {
      const { data, error } = await supabase
        .from('insights')
        .select('custom_query')
        .eq('custom_user_id', userId)

      if (!error && data) {
        const uniqueQueries = [...new Set(data.map((d: any) => d.custom_query))]
        setUserQueries(uniqueQueries)
      }
    }

    fetchUserData()
    fetchUserQueries()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!credits || credits <= 0) {
      setShowNoCreditsModal(true)
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/custom-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query })
      })

      const data = await res.json()

      if (res.ok) {
        const { subreddits } = data
        setScrapingMessage(`Scraping: ${subreddits.join(', ')}`)
        await fetch('/api/scrape-subreddits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, query, subreddits })
        })

        toast.success('Scraping complete')
        setCredits((prev) => (prev !== null ? prev - 1 : null))
        setSelectedQuery(query)
        setScrapingMessage(null)
      } else {
        toast.error(data.error || 'Something went wrong')
      }
    } catch (err) {
      toast.error('Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedQuery) return
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('custom_query', selectedQuery)
        .order('created_at', { ascending: false })

      if (!error && data) setResults(data)
    }

    fetchResults()
  }, [selectedQuery])

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
    <div className="p-4 text-white max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-950 shadow-md">
        <Link href="/" className="w-10">
          <Image src="/surfrider-icon.png" alt="SurfRider" width={40} height={40} />
        </Link>
        <div className="text-right text-xs text-zinc-400 space-y-1">
          <div className="text-white font-medium">Credits: {credits}</div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCreditOptions(true)}
              className="underline text-blue-400 hover:text-white"
            >
              Buy Credits
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                localStorage.removeItem('fake_user')
                window.location.href = '/'
              }}
              className="text-red-400 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {showCreditOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-yellow-400 via-green-400 via-blue-500 to-purple-600 shadow-xl">
            <div className="rounded-[14px] bg-zinc-900 px-8 py-6 text-white text-center font-neon">
              <h2 className="text-2xl font-bold mb-4">Choose Your Pack 🏄</h2>
              <div className="space-y-3">
                {PRICE_OPTIONS.filter(opt => opt.priceId).map((opt) => (
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

      {/* ... rest of your component remains unchanged ... */}
    </div>
  )
}
