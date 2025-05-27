'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'
import SubscribeForm from '@/components/SubscribeForm'


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
      .select('id, post_id, signal, why_it_matters, action_angle, urgency_score, novelty_score, tone, sector, created_at, interesting_score')
      .order('interesting_score', { ascending: false })  // 🧠 Sort by most interesting first
    
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
        {/* LOGO */}
        <div className="flex justify-start mb-4 border-t border-zinc-700 pt-4">
          <div className="w-full max-w-[18rem] h-auto">
            <Image
              src="/occulta-logo.png"
              alt="Occulta Logo"
              width={400}
              height={200}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* INTRO */}
        <p className="text-gray-300 mb-6 text-base sm:text-lg">
          Live feed of emerging startup signals and product demand
        </p>

        {/* FILTERS */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search insights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1 basis-0 min-w-0 bg-zinc-800 border-zinc-700 max-w-xs"
          />

          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1 basis-0 min-w-0 bg-zinc-800 border-zinc-700 max-w-xs"
          >
            <option value="">All Sectors</option>
            <option value="ecommerce">Ecommerce</option>
            <option value="SaaS">SaaS</option>
            <option value="creator">Creator Tools</option>
            <option value="health">Health</option>
            <option value="other">Other</option>
          </select>

          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1 basis-0 min-w-0 bg-zinc-800 border-zinc-700 max-w-xs"
          >
            <option value="">All Tones</option>
            <option value="curious">Curious</option>
            <option value="frustrated">Frustrated</option>
            <option value="excited">Excited</option>
            <option value="reflective">Reflective</option>
          </select>

          <div className="flex flex-col text-sm flex-1 basis-0 min-w-0 max-w-xs">
            <label htmlFor="urgency" className="mb-1 text-gray-400 font-medium">
              Min Urgency: {minUrgency}
            </label>
            <input
              type="range"
              id="urgency"
              min={1}
              max={10}
              value={minUrgency}
              onChange={(e) => setMinUrgency(Number(e.target.value))}
              className="w-full max-w-full appearance-none"
            />
          </div>

          <div className="flex flex-col text-sm flex-1 basis-0 min-w-0 max-w-xs">
            <label htmlFor="novelty" className="mb-1 text-gray-400 font-medium">
              Min Novelty: {minNovelty}
            </label>
            <input
              type="range"
              id="novelty"
              min={1}
              max={10}
              value={minNovelty}
              onChange={(e) => setMinNovelty(Number(e.target.value))}
              className="w-full max-w-full appearance-none"
            />
          </div>
        </div>

        {/* EMAIL CAPTURE */}
        <section className="py-10 border-t border-zinc-700">
<div className="mt-1 max-w-xl text-left">
<h2 className="text-xl font-bold mb-2 text-white hover:underline cursor-pointer">
  <Link href="/subscribe">📬 Stay in the loop</Link>
</h2>
<p className="text-sm text-gray-400 mb-4">Subscribe for top insights delivered daily.</p>

<SubscribeForm />
  {status === 'success' && <p className="text-green-400 mt-2">✅ Subscribed!</p>}
  {status === 'error' && <p className="text-red-400 mt-2">❌ Something went wrong.</p>}
</div>
</section>


        {/* EMPTY STATE */}
        {insights.length === 0 && (
          <p className="rounded-2xl border border-purple-500 bg-zinc-900/80 shadow-md p-6 mb-6 text-center">
            No matching insights yet. Try a different filter.
          </p>
        )}

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="w-full rounded-xl border border-purple-500 bg-zinc-900/80 p-6 shadow-md overflow-hidden"
            >
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-purple-200 mb-3 break-words">
              <Link href={`/signal?id=${insight.id}`} className="hover:underline">
                {insight.signal} <span aria-hidden>↗</span>
                </Link>
              </h2>

              <p className="text-sm text-zinc-400 mt-3 break-words">
                <strong className="text-white">🧨 Why It Matters:</strong> {insight.why_it_matters}
              </p>
              <p className="text-sm text-zinc-400 mt-3 break-words">
                <strong className="text-white">🛠 Action Angle:</strong> {insight.action_angle}
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-4 min-w-0">
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
                    className="blue-neon-tag cursor-pointer hover:underline"
                  >
                    🔗 Link
                  </a>
                )}
              <CopyButton
                text={`🔍 ${insight.signal}\n\n🧨 Why It Matters: ${insight.why_it_matters}\n\n🛠 Action Angle: ${insight.action_angle}\n\nhttps://occulta.ai/signal/${insight.id}`}
              />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
