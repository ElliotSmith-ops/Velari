'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Image from 'next/image'

type Insight = {
  id: string
  post_id?: string
  summary: string
  pain_point: string
  idea: string
  urgency_score: number
  novelty_score: number
  tone: string
  category: string
  created_at: string
  
}

export default function Home() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [category, setCategory] = useState('')
  const [tone, setTone] = useState('')
  const [search, setSearch] = useState('')
  const [minUrgency, setMinUrgency] = useState(1)
  const [minNovelty, setMinNovelty] = useState(1)

  useEffect(() => {
    const fetchInsights = async () => {
      let query = supabase.from('insights').select('*')

      if (category) query = query.eq('category', category)
      if (tone) query = query.eq('tone', tone)
      const { data, error } = await query.limit(50)

      if (error) {
        console.error('❌ Error fetching insights:', error)
        setInsights([])
      } else {
        const filtered = (data as Insight[]).filter(i =>
          (i.urgency_score >= minUrgency && i.novelty_score >= minNovelty) &&
          (
            i.summary.toLowerCase().includes(search.toLowerCase()) ||
            i.idea.toLowerCase().includes(search.toLowerCase()) ||
            i.pain_point.toLowerCase().includes(search.toLowerCase())
          )
        )
        setInsights(filtered)
      }
    }

    fetchInsights()
  }, [category, tone, search, minUrgency, minNovelty])

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-800" />
      <main className="min-h-screen max-w-6xl mx-auto w-full px-4 sm:px-6 text-white">
        {/* LOGO */}
        <div className="flex justify-start mb-4 border-t border-zinc-700 pt-4">
          <div className="w-full max-w-[18rem] h-auto">
            <Image
              src="/velari-logo.png"
              alt="Velari Logo"
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1 basis-0 min-w-0 bg-zinc-800 border-zinc-700 max-w-xs"
          >
            <option value="">All Categories</option>
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
                {insight.summary}
              </h2>

              <p className="text-sm text-zinc-400 break-words">
                <strong>Pain:</strong> {insight.pain_point}
              </p>
              <p className="text-sm text-zinc-400 break-words">
                <strong>Idea:</strong> {insight.idea}
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-4 min-w-0">
                <span className="neon-tag">{insight.category}</span>
                <span className="neon-tag">🎭 Tone: {insight.tone}</span>
                <span className="neon-tag">🔥 Urgency: {insight.urgency_score}</span>
                <span className="neon-tag">💡 Novelty: {insight.novelty_score}</span>
                <span className="neon-tag">{new Date(insight.created_at).toLocaleDateString()}</span>
                {insight.post_id && (
    <a
      href={insight.post_id}
      target="_blank"
      rel="noopener noreferrer"
      className="neon-tag cursor-pointer hover:underline"
    >
      🔗 Link
    </a>
  )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
