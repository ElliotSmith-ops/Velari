"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('subscribers').insert({ email })
    if (error) {
      setStatus('error')
    } else {

      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        })    
      setStatus('success')
      setEmail('')
    }
  }

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 mt-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition"
      >
        Subscribe
      </button>
      {status === 'success' && <p className="text-green-400 text-sm">✅ Subscribed!</p>}
      {status === 'error' && <p className="text-red-400 text-sm">❌ Something went wrong.</p>}
    </form>
  )
}
