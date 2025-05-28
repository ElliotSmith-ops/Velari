'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProPage() {
  const [userId, setUserId] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    console.log(userId, query)

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
        setMessage(`🔍 Scraping the internet and processing insights. This takes a minute or two so be patient :) : ${subreddits.join(', ')}`)

        // Call your Python scraper here (step 2)
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
    <div className="max-w-xl mx-auto mt-16 px-4">
      <h1 className="text-3xl font-bold mb-6 text-purple-300">🚀 Pro Custom Trend Scanner</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white"
        />
        <input
          type="text"
          placeholder="Describe your trend or idea..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg border border-zinc-600 bg-zinc-800 text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 rounded-lg"
        >
          {loading ? 'Scanning...' : 'Scan Trends'}
        </button>
      </form>
      {message && <p className="mt-6 text-sm text-zinc-300">{message}</p>}
    </div>
  )
}
