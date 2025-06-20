'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import CopyButton from '@/components/CopyButton'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import ShareButton from '@/components/ShareButton'
import { ClipboardCopy, ExternalLink, Share2 } from 'lucide-react'



type ProFeaturesMobileProps = {
  userId: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
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

export default function ProFeaturesMobile () {
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [showCreditOptions, setShowCreditOptions] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)


  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
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
  
      if (!error && profile) {
        setUsername(profile.username)
        setCredits(profile.credits)
      }
    }
  
    loadUser()
  }, [])

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
        setScrapingMessage(`🔍 Scouring the internet for: ${subreddits.join(', ')}. Results are generated live and can take 1-2 minutes.`)
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
  }, [selectedQuery]);

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
      {/* Logo & Credit Bar */}
      <div className="flex justify-between items-center mb-6">
  {/* Left: Logo */}
  <Link href="/" className="w-10">
    <Image src="/surfrider-icon.png" alt="SurfRider" width={40} height={40} />
  </Link>

  {/* Right: Capsule */}
  <div className="flex items-center gap-1 px-4 py-2 border border-zinc-700 rounded-full text-xs text-gray-200 bg-zinc-900 shadow-sm"
    style={{ fontFamily: 'var(--font-modern)' }}
>
    <span>
      <span className="text-white font-semibold">Credits:</span>
      <span className="text-white">{credits}</span>
    </span>
    <button
  onClick={() => setShowCreditOptions(true)}
  className="underline text-blue-400 hover:text-white"
>
  Purchase Credits
</button>
    <span
        onClick={() => router.push('/account')}
        className="cursor-pointer hover:text-white transition"
    >
        Account
    </span>
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

      {/* Welcome + Query Form */}
      <div className="text-center mb-6">
        <Image src="/surfriderpro-logo.png" alt="SurfRider Pro" width={140} height={40} className="mx-auto mb-2" />
        {username && (
        <p className="text-sm text-gray-400">
            Welcome back, <span className="text-white font-medium">{username}</span>.
        </p>
        )}
        <p className="text-sm text-zinc-400">Search anything. We’ll find your next million dollar idea.</p>
      </div>

      {showNoCreditsModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-yellow-400 via-green-400 via-blue-500 to-purple-600 shadow-xl">
      <div className="rounded-[14px] bg-zinc-900 px-8 py-6 text-center text-white font-neon">
        <h2 className="text-2xl font-bold mb-2">Out of Credits 🏄</h2>
        <p className="text-gray-400 mb-6 text-sm">
          You’ve used all your Pro searches.<br />Recharge to keep surfing the signal.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowNoCreditsModal(false)}
            className="px-4 py-2 rounded-xl border border-purple-500 text-sm text-purple-300 hover:bg-zinc-800 transition shadow"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              setShowNoCreditsModal(false)
              setShowCreditOptions(true)
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 via-green-400 via-blue-500 to-purple-600 hover:brightness-110 transition text-sm font-semibold text-white shadow-lg"
            style={{
              textShadow: '0px 1px 2px rgba(0,0,0,0.7)',
              backgroundClip: 'padding-box'
            }}
          >
            Buy Credits
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="e.g. AI tools for ADHD"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-xl border border-zinc-600 bg-zinc-800 text-white text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl text-sm"
        >
          {loading ? 'Scanning...' : 'Scan Trends'}
        </button>
      </form>

      {userQueries.length > 0 && (
  <div className="mt-4">
    <label className="block text-xs text-zinc-400 mb-1">Select past query:</label>
    <select
      value={selectedQuery}
      onChange={(e) => setSelectedQuery(e.target.value)}
      className="w-full px-4 py-2 rounded-xl border border-zinc-600 bg-zinc-800 text-white text-sm"
    >
      <option value="">-- Select a past query --</option>
      {userQueries.map((q, i) => (
        <option key={i} value={q}>{q}</option>
      ))}
    </select>
  </div>
)}


      {scrapingMessage && <p className="text-sm text-purple-400 mt-4">{scrapingMessage}</p>}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((insight , i) => (
          <div
          key={i}
          onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
          className="rounded-xl p-[2px] bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400"
          style={{ fontFamily: 'var(--font-modern)' }}

        >
          <div className="rounded-xl p-4 shadow bg-zinc-800 relative">
            <div className="absolute top-2 right-2 text-xs text-purple-400 animate-pulse">Tap to expand</div>
            <p className="font-semibold text-lg text-white whitespace-pre-wrap">{insight.signal}</p>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-2">
              <span className="neon-tag"> Tone: {insight.tone}</span>
              <span className="neon-tag"> Sector: {insight.sector}</span>
              <span className="neon-tag"> Urgency: {insight.urgency_score || insight.urgency}</span>
              <span className="neon-tag"> Novelty: {insight.novelty_score || insight.novelty}</span>
            </div>
        
            {expandedIndex === i && (
              <>
                <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">
                  <strong className="text-white"> Why It Matters:</strong> {insight.why_it_matters || insight.why}
                </p>
                <p className="text-sm text-purple-400 mt-1 italic whitespace-pre-wrap">
                  <strong className="text-white"> Action Angle:</strong> {insight.action_angle || insight.action}
                </p>
              </>
            )}
        
            <div className="flex gap-4 mt-4 justify-start items-center flex-wrap">
              {insight.post_id && (
                <a
                  href={insight.post_id}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-400 hover:text-white transition cursor-pointer"
                  title="View original post"
                >
                  <ExternalLink size={18} />
                </a>
              )}
        
              <CopyButton
                text={`${insight.signal}\n\n Why It Matters: ${insight.why_it_matters}\n\n Action Angle: ${insight.action_angle}\n\nhttps://surfrider.io/signal/${insight.id}`}
              />
        
              <ShareButton insight={{ id: insight.id, signal: insight.signal }} />
            </div>
          </div>
        </div>
          ))}
        </div>
      )}
    </div>
  )
}
