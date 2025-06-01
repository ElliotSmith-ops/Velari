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

  useEffect(() => {
    const fetchInsights = async () => {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) setInsights(data)
    }

    fetchInsights()
  }, [])

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
      <Link
        href="/m/pro"
        className="w-full rounded-xl border-2 border-purple-400 py-3 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-lg"
      >
        Try SurfRider Pro
      </Link>

      {/* Search and Filter */}
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
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-4">
        {filteredInsights.map((insight, i) => (
          <div
            key={i}
            className="border-2 border-purple-600 rounded-xl p-4 shadow bg-zinc-800"
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
          >
            <p className="font-semibold text-lg text-white whitespace-pre-wrap">🔍 {insight.signal}</p>

            {expandedIndex === i && (
              <>
                <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">
                  <strong className="text-white">🧨 Why It Matters:</strong> {insight.why_it_matters || insight.why}
                </p>
                <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">
                  <strong className="text-white">🛠 Action Angle:</strong> {insight.action_angle || insight.action}
                </p>
              </>
            )}

            <div className="flex flex-wrap justify-start items-center gap-2 mt-3 text-xs text-gray-400">
              <span className="neon-tag">🎭 Tone: {insight.tone}</span>
              <span className="neon-tag">🔥 Urgency: {insight.urgency_score || insight.urgency}</span>
              <span className="neon-tag">💡 Novelty: {insight.novelty_score || insight.novelty}</span>
              {insight.url && (
                <a
                  href={insight.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blue-neon-tag hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  🔗 Origin
                </a>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <CopyButton
                  text={`🔍 ${insight.signal}\n\n🧨 Why It Matters: ${insight.why_it_matters || insight.why}\n\n🛠 Action Angle: ${insight.action_angle || insight.action}`}
                  className="text-xs px-2 py-1 border border-blue-400 rounded hover:bg-blue-500/10"
                />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ShareButton
                  insight={{ id: insight.id, signal: insight.signal }}
                  className="text-white text-lg"
                />
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
