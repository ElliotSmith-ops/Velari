'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'
import SubscribeForm from '@/components/SubscribeForm'
import { Button } from '@/components/ui/button'
import ShareButton from '@/components/ShareButton'


type Insight = {
  id: string
  post_id: string | null
  signal: string
  why_it_matters: string
  action_angle: string
  urgency_score: number
  novelty_score: number
  tone: string
  sector: string
  created_at: string
  interesting_score: number
}

export default function Home() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [sector, setSector] = useState('')
  const [tone, setTone] = useState('')
  const [search, setSearch] = useState('')
  const [minUrgency, setMinUrgency] = useState(1)
  const [minNovelty, setMinNovelty] = useState(1)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const router = useRouter()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('subscribers').insert({ email })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setEmail('')
    }
  }

  useEffect(() => {
    const fetchInsights = async () => {
      let query = supabase
        .from('insights')
        .select('*')
        .order('interesting_score', { ascending: false })

      if (sector) query = query.eq('sector', sector)
      if (tone) query = query.eq('tone', tone)
      const { data, error } = await query.limit(200)

      if (error) {
        console.error('❌ Error fetching insights:', error)
        setInsights([])
      } else {
        const filtered = (data as Insight[]).filter(i =>
          (i.urgency_score >= minUrgency && i.novelty_score >= minNovelty) &&
          (
            i.signal.toLowerCase().includes(search.toLowerCase()) ||
            i.why_it_matters.toLowerCase().includes(search.toLowerCase()) ||
            i.action_angle.toLowerCase().includes(search.toLowerCase())
          )
        )
        setInsights(filtered)
      }
    }

    fetchInsights()
  }, [sector, tone, search, minUrgency, minNovelty])

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-800" />
      <main className="min-h-screen max-w-6xl mx-auto w-full px-4 sm:px-6 text-white">

        {/* Hero Section */}
        <section className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-10 pt-6 pb-12">
          <div className="flex-1 min-w-[300px]">
            <Image
              src="/surfrider-logo.png"
              alt="SurfRider"
              width={300}
              height={100}
              className="h-20 w-auto mx-auto sm:mx-0"
              priority
            />
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-snug">
              <span className="text-purple-400">Trends rise fast.</span><br />
              <span className="text-white">SurfRider moves faster.</span>
            </h1>
            <p className="mt-3 text-gray-400 text-base sm:text-lg max-w-xl">
              Arming founders, investors, and builders with real-time, AI-curated <span className="underline decoration-dotted text-white">signals</span> from the internet’s raw frontier.
            </p>
          </div>
          <div className="flex flex-col flex-shrink-0 w-full sm:w-auto mt-2">
  <div className="flex flex-col items-center text-center">
  <Link href="/pro">
  <div className="relative w-40 h-24 mb-3 cursor-pointer hover:opacity-90 transition">
    <Image
      src="/surfriderpro-logo.png"
      alt="SurfRider Pro Logo"
      fill
      className="object-contain"
      priority
    />
  </div>
</Link>
<button
  onClick={() => router.push('/pro')}
  className="cursor-pointer bg-black px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
>
  <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent" style={{ fontFamily: 'Klavika, sans-serif' }}>
    Try for free / Sign in
  </span>
</button>
  </div>
</div>

        </section>

        {/* Subscribe */}
        <section className="py-10 border-t border-zinc-700">
          <div className="mt-1 max-w-xl text-center lg:text-left mx-auto">
            <h2 className="text-xl font-bold mb-2 text-white hover:underline cursor-pointer">
              <Link href="/subscribe">📬 Stay in the loop</Link>
            </h2>
            <p className="text-sm text-gray-400 mb-4">Subscribe for top insights delivered daily.</p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm w-full"
              />
              <Button type="submit" className="text-sm px-4 py-2">Subscribe</Button>
            </form>
            {status === 'success' && <p className="text-green-400 mt-2">✅ Subscribed!</p>}
            {status === 'error' && <p className="text-red-400 mt-2">❌ Something went wrong.</p>}
          </div>
        </section>

        {/* Filters and Insights */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <input type="text" placeholder="Search insights..." value={search} onChange={(e) => setSearch(e.target.value)} className="border px-3 py-2 rounded-lg text-sm bg-zinc-800 border-zinc-700 max-w-xs" />
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="border px-3 py-2 rounded-lg text-sm bg-zinc-800 border-zinc-700 max-w-xs">
            <option value="">All Sectors</option>
            <option value="ecommerce">Ecommerce</option>
            <option value="SaaS">SaaS</option>
            <option value="creator">Creator Tools</option>
            <option value="health">Health</option>
            <option value="other">Other</option>
          </select>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="border px-3 py-2 rounded-lg text-sm bg-zinc-800 border-zinc-700 max-w-xs">
            <option value="">All Tones</option>
            <option value="curious">Curious</option>
            <option value="frustrated">Frustrated</option>
            <option value="excited">Excited</option>
            <option value="reflective">Reflective</option>
          </select>
          <div className="flex flex-col text-sm max-w-xs">
            <label htmlFor="urgency" className="mb-1 text-gray-400 font-medium">Min Urgency: {minUrgency}</label>
            <input type="range" id="urgency" min={1} max={10} value={minUrgency} onChange={(e) => setMinUrgency(Number(e.target.value))} />
          </div>
          <div className="flex flex-col text-sm max-w-xs">
            <label htmlFor="novelty" className="mb-1 text-gray-400 font-medium">Min Novelty: {minNovelty}</label>
            <input type="range" id="novelty" min={1} max={10} value={minNovelty} onChange={(e) => setMinNovelty(Number(e.target.value))} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              onClick={() => router.push(`/signal?id=${insight.id}`)}
              className="w-full rounded-xl border border-purple-500 bg-zinc-900/80 p-6 shadow-md hover:shadow-lg transition cursor-pointer group"
            >
              <h2 className="text-xl font-bold text-purple-200 mb-3 break-words">
                🔍 {insight.signal} <span aria-hidden>↗</span>
              </h2>
              <p className="text-sm text-zinc-400 mt-3 break-words">
                <strong className="text-white">🧨 Why It Matters:</strong> {insight.why_it_matters}
              </p>
              <p className="text-sm text-zinc-400 mt-3 break-words">
                <strong className="text-white">🛠 Action Angle:</strong> {insight.action_angle}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-4 items-center">
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
                <div className="flex justify-between items-start">
                <ShareButton insight={{ id: insight.id, signal: insight.signal }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
