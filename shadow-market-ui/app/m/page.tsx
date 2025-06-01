// app/m/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import CopyButton from '@/components/CopyButton'
import ShareButton from '@/components/ShareButton'

export default function MobileHomePage() {
  const [insights, setInsights] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [sector, setSector] = useState('')
  const [sortField, setSortField] = useState('created_at')

  useEffect(() => {
    const fetchInsights = async () => {
      let query = supabase
        .from('insights')
        .select('*')
        .order(sortField, { ascending: false })

      if (sector) query = query.eq('sector', sector)

      const { data, error } = await query

      if (data) setInsights(data)
    }

    fetchInsights()
  }, [sector, sortField])

  const filteredInsights = insights.filter((insight) => {
    const matchesSearch = search
      ? insight.signal.toLowerCase().includes(search.toLowerCase())
      : true
    const matchesFilter = filter ? insight.tone === filter : true
    return matchesSearch && matchesFilter
  })

  return (
    <main className="bg-zinc-900 min-h-screen text-white pb-20 px-4 py-6 flex flex-col gap-6">
      {/* Logo */}
      <div className="flex justify-center">
        <Image
          src="/surfrider-logo.png"
          alt="SurfRider Logo"
          width={120}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      {/* Headline */}
      <div className="text-center">
        <h1 className="text-base text-gray-300 font-medium">
          AI-Curated Signals from the Internet's Frontier
        </h1>
      </div>

      {/* CTA */}
      <a
        href="/m/pro"
        className="relative w-full text-lg font-bold text-center py-3 rounded-xl bg-black text-transparent bg-clip-text"
        style={{
            backgroundImage: 'linear-gradient(to right, #ec4899, #facc15, #22c55e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        }}
       >
      <span className="relative z-10">Try SurfRider Pro</span>
      <span
        className="absolute inset-0 rounded-xl border-2"
        style={{
        borderImage: 'linear-gradient(to right, #ec4899, #facc15, #22c55e) 1',
        }}
        />
      </a>

      {/* Search and Filters */}
      <div className="flex flex-col gap-2">
        <input
          className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
          placeholder="Search signals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-3 rounded bg-zinc-800 text-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Tones</option>
          <option value="urgent">Urgent</option>
          <option value="insightful">Insightful</option>
          <option value="speculative">Speculative</option>
        </select>
        <select
          className="p-3 rounded bg-zinc-800 text-white"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        >
          <option value="">All Sectors</option>
          <option value="Ecommerce">Ecommerce</option>
          <option value="SaaS">SaaS</option>
          <option value="Creator Tools">Creator Tools</option>
          <option value="Health">Health</option>
          <option value="AI">AI</option>
          <option value="Education">Education</option>
          <option value="Finance">Finance</option>
          <option value="Consumer">Consumer</option>
          <option value="Other">Other</option>
        </select>
        <select
          className="p-3 rounded bg-zinc-800 text-white"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="created_at">Sort: Default</option>
          <option value="urgency_score">Sort: Urgency</option>
          <option value="novelty_score">Sort: Novelty</option>
        </select>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-4">
        {filteredInsights.map((insight, i) => (
          <div
            key={i}
            className="border-2 border-purple-600 rounded-xl p-4 shadow bg-zinc-800 relative"
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
          >
            <div className="absolute top-2 right-2 text-xs text-purple-400 animate-pulse">Tap to expand</div>
            <p className="font-semibold text-lg text-white whitespace-pre-wrap">{insight.signal}</p>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-2">
              <span className="neon-tag">🎭 Tone: {insight.tone}</span>
              <span className="neon-tag">🎭 Sector: {insight.sector}</span>
              <span className="neon-tag">🔥 Urgency: {insight.urgency_score || insight.urgency}</span>
              <span className="neon-tag">💡 Novelty: {insight.novelty_score || insight.novelty}</span>
            </div>

            {expandedIndex === i && (
              <>
                <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">
                  <strong className="text-white">🧨 Why It Matters:</strong> {insight.why_it_matters || insight.why}
                </p>
                <p className="text-sm text-purple-400 mt-1 italic whitespace-pre-wrap">
                  <strong className="text-white">🛠 Action Angle:</strong> {insight.action_angle || insight.action}
                </p>
              </>
            )}

            <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
              <div className="flex gap-2 items-center">
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
                <CopyButton
                  text={`🔍 ${insight.signal}\n\n🧨 Why It Matters: ${insight.why_it_matters}\n\n🛠 Action Angle: ${insight.action_angle}\n\nhttps://occulta.ai/signal/${insight.id}`}
                />
                <ShareButton insight={{ id: insight.id, signal: insight.signal }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around py-2 text-sm text-gray-400">
        <Link href="/m" className="flex flex-col items-center">
          <span>🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/m/pro" className="flex flex-col items-center">
          <span>🔍</span>
          <span>Pro</span>
        </Link>
        <Link href="/m/account" className="flex flex-col items-center">
          <span>👤</span>
          <span>Account</span>
        </Link>
      </nav>
    </main>
  )
}
