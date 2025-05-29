'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import CopyButton from '@/components/CopyButton'
import toast from 'react-hot-toast'
import Link from 'next/link'


type ProFeaturesProps = {
  userId: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProFeatures({ userId }: ProFeaturesProps) {
  const [username, setUsername] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userQueries, setUserQueries] = useState<string[]>([])
  const [selectedQuery, setSelectedQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [credits, setCredits] = useState<number | null>(null)


  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('fake_user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      setUsername(parsed.username)
      setCredits(parsed.credits)
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('fake_user')
    router.push('/')
  }

  const handleBuyCredits = () => {
    alert("🧠 Not implemented yet — but this is where you'd trigger Stripe or credit logic.")
  }

  useEffect(() => {
    const fetchUserQueries = async () => {
      if (!userId) return
      const { data, error } = await supabase
        .from('insights')
        .select('custom_query')
        .eq('custom_user_id', userId)

      if (error) {
        console.error('Error fetching queries:', error)
      } else {
        const uniqueQueries = [...new Set(data.map((d: any) => d.custom_query))]
        setUserQueries(uniqueQueries)
      }
    }

    fetchUserQueries()
  }, [userId])

  useEffect(() => {
    const fetchResultsForQuery = async () => {
      if (!userId || !selectedQuery) return

      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('custom_user_id', userId)
        .eq('custom_query', selectedQuery)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching results:', error)
      } else {
        setResults(data)
      }
    }

    fetchResultsForQuery()
  }, [selectedQuery, userId])

  useEffect(() => {
    if (selectedQuery) {
      toast.success(`Showing results for: "${selectedQuery}"`)
    }
  }, [selectedQuery])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      setMessage('❌ You must be signed in to use Pro features.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/custom-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Something went wrong')
      } else {
        const { subreddits } = data
        setMessage(`🔍 Scraping Reddit for: ${subreddits.join(', ')}`)

        const trigger = await fetch('/api/scrape-subreddits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, query, subreddits })
        })

        if (!trigger.ok) {
          setMessage('❌ Failed to trigger scraper.')
        } else {
          setMessage('✅ Subreddits scraped. GPT is analyzing now…')
        }
      }
    } catch (err) {
      console.error(err)
      setMessage('❌ Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
<div className="flex justify-between items-center w-full mb-6 pt-4">
  {/* SurfRider Pro Logo on the left */}
  <Link href="/" className="w-12 sm:w-15 block">
    <Image
      src="/surfrider-icon.png"
      alt="SurfRider Logo"
      width={240}
      height={80}
      className="w-full h-auto object-contain"
      priority
    />
  </Link>

  {/* Right-side capsule */}
  <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-sm text-gray-300 shadow-sm">
    <span>
      Credits: <span className="text-white font-medium">{credits}</span>
    </span>
    <button
      onClick={handleBuyCredits}
      className="text-blue-400 hover:text-blue-300 font-medium"
    >
      Purchase Credits
    </button>
    <span
      onClick={handleSignOut}
      className="cursor-pointer hover:text-white transition"
    >
      Sign Out
    </span>
  </div>
</div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-800" />
      <main className="min-h-screen max-w-4xl mx-auto px-4 py-0 text-white">
        {/* Header */}
        <div className="relative mb-10">
        <div className="text-center">
        <Image
        src="/surfriderpro-logo.png"
        alt="SurfRider Pro Logo"
        width={240}
        height={90}
        className="mx-auto mb-4"
        />
        {username && (
        <p className="text-sm text-gray-400">
            Welcome back, <span className="text-white font-medium">{username}</span>
        </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
            Search anything.
        </p>
        <p className="text-sm text-gray-500 mt-1 underline">
            We'll find your next million dollar idea.
        </p>
    </div>
</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
  <label className="block text-sm text-gray-300 mb-1">Describe what you’re exploring</label>
  <input
    type="text"
    placeholder="e.g. AI tools for ADHD"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    required
    className="w-full px-4 py-3 rounded-xl border border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <button
    type="submit"
    disabled={loading || !userId}
    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl transition"
  >
    {loading ? 'Scanning...' : 'Scan Trends'}
  </button>
</form>

{userQueries.length > 0 && (
  <div className="mt-8 max-w-lg mx-auto">
    <label className="block text-sm font-medium text-gray-300 mb-1">Select a past query</label>
    <select
      value={selectedQuery}
      onChange={(e) => setSelectedQuery(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">-- Choose a query --</option>
      {userQueries.map((q, i) => (
        <option key={i} value={q}>{q}</option>
      ))}
    </select>
  </div>
)}

        {selectedQuery && (
          <p className="text-sm text-purple-300 mt-4">
            Showing results for: <span className="text-white font-medium">{selectedQuery}</span>
          </p>
        )}

{results.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 items-start">
    {results.map((insight) => (
      <div
        key={insight.id}
        className="p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-yellow-400 via-green-400 via-blue-500 to-purple-600"
      >
        <div
          onClick={() => router.push(`/signal?id=${insight.id}`)}
          className="rounded-[14px] bg-black p-6 shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer group h-full"
        >
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-purple-200 mb-3 break-words">
            🔍 {insight.signal} <span aria-hidden>↗</span>
          </h2>

          <p className="text-sm text-zinc-400 mt-3 break-words">
            <strong className="text-white">🧨 Why It Matters:</strong> {insight.why_it_matters}
          </p>
          <p className="text-sm text-zinc-400 mt-3 break-words">
            <strong className="text-white">🛠 Action Angle:</strong> {insight.action_angle}
          </p>

          <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-4 min-w-0 items-center">
            <span className="neon-tag">{insight.sector}</span>
            <span className="neon-tag">🎭 Tone: {insight.tone}</span>
            <span className="neon-tag">🔥 Urgency: {insight.urgency_score}</span>
            <span className="neon-tag">💡 Novelty: {insight.novelty_score}</span>
            <span className="neon-tag">{new Date(insight.created_at).toLocaleDateString()}</span>
            {insight.post_id && (
              <a
                href={insight.post_id}
                target="_blank"
                rel="noopener noreferrer"
                className="blue-neon-tag hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                🔗 Insight Origin
              </a>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <CopyButton
                text={`🔍 ${insight.signal}\n\n🧨 Why It Matters: ${insight.why_it_matters}\n\n🛠 Action Angle: ${insight.action_angle}\n\nhttps://occulta.ai/signal/${insight.id}`}
              />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

        {message && (
          <p className="mt-6 text-sm text-zinc-300 whitespace-pre-line">{message}</p>
        )}

        {/* Pulsing Loader */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {Array(6).fill(null).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-48"
              >
                <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-zinc-700 rounded w-1/2 mb-4" />
                <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-5/6" />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}