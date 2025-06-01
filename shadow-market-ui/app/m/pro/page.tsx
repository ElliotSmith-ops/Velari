// app/m/pro/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function MobileProPage() {
  const [userId, setUserId] = useState('')
  const [query, setQuery] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const localUser = localStorage.getItem('fake_user')
    if (localUser) {
      const parsed = JSON.parse(localUser)
      setUserId(parsed.id)
      setCredits(parsed.credits || 0)
    }
  }, [])

  const handleSubmit = async () => {
    if (!query.trim()) return
    setLoading(true)

    const response = await fetch('/api/custom-trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, query }),
    })

    const data = await response.json()
    if (data.error) {
      alert(data.error)
    } else {
      setResults(data.insights || [])
    }

    setLoading(false)
  }

  return (
    <main className="bg-zinc-900 min-h-screen text-white px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-purple-400">SurfRider Pro</h1>
        <p className="text-sm mt-1">Credits: {credits ?? '--'}</p>
      </div>

      {/* Query input */}
      <div className="flex flex-col gap-2">
        <input
          className="p-3 rounded bg-zinc-800 text-white placeholder-gray-400"
          placeholder="What trend are you watching?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Scanning Reddit...' : 'Find Signals'}
        </Button>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {results.map((r, i) => (
          <div key={i} className="bg-zinc-800 rounded-xl p-4 shadow">
            <p className="font-semibold text-lg">{r.signal}</p>
            <p className="text-sm text-gray-400 mt-1">{r.why}</p>
            <p className="text-xs mt-2 text-gray-500 italic">
              Urgency: {r.urgency} | Novelty: {r.novelty}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
