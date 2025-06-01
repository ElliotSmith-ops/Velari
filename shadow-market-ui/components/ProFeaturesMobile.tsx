'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import CopyButton from '@/components/CopyButton'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

type ProFeaturesMobileProps = {
  userId: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProFeaturesMobile({ userId }: ProFeaturesMobileProps) {
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

  return (
    <div className="p-4 text-white max-w-md mx-auto">
      {/* Logo & Credit Bar */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="w-10">
          <Image src="/surfrider-icon.png" alt="SurfRider" width={40} height={40} />
        </Link>
        <div className="text-xs text-gray-400">Credits: <span className="text-white">{credits}</span></div>
      </div>

      {/* Welcome + Query Form */}
      <div className="text-center mb-6">
        <Image src="/surfriderpro-logo.png" alt="SurfRider Pro" width={140} height={40} className="mx-auto mb-2" />
        <p className="text-sm text-zinc-400">Search anything. We’ll find your next million dollar idea.</p>
      </div>

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

      {scrapingMessage && <p className="text-sm text-purple-400 mt-4">{scrapingMessage}</p>}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((insight) => (
            <div
              key={insight.id}
              onClick={() => router.push(`/signal?id=${insight.id}`)}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 shadow hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="font-semibold text-purple-300 text-sm mb-2">🔍 {insight.signal}</h3>
              <p className="text-xs text-gray-300">
                <strong>🧨 Why It Matters:</strong> {insight.why_it_matters}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                <strong>🛠 Action Angle:</strong> {insight.action_angle}
              </p>
              <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-zinc-400">
                <span>{insight.sector}</span>
                <span>🔥 {insight.urgency_score}</span>
                <span>💡 {insight.novelty_score}</span>
                <CopyButton
                  text={`🔍 ${insight.signal}\n\n🧨 Why It Matters: ${insight.why_it_matters}\n\n🛠 Action Angle: ${insight.action_angle}\n\nhttps://occulta.ai/signal/${insight.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
