// app/m/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function MobileHomePage() {
  const [insights, setInsights] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

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
      <Button asChild className="w-full bg-purple-600 text-white text-lg py-3 rounded-xl">
        <a href="/m/pro">Try SurfRider Pro</a>
      </Button>

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
          <div key={i} className="bg-zinc-800 rounded-xl p-4 shadow">
            <p className="font-semibold text-lg">{insight.signal}</p>
            <p className="text-sm text-gray-400 mt-1">{insight.why}</p>
            <p className="text-xs mt-2 text-gray-500 italic">
              Tone: {insight.tone} | Urgency: {insight.urgency} | Novelty: {insight.novelty}
            </p>
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
