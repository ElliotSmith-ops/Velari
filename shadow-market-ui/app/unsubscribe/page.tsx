// app/unsubscribe/page.tsx

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'



export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('subscribers').delete().eq('email', email)
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setEmail('')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-xl border border-purple-500 bg-zinc-900/80 p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Image
              src="/occulta-logo.png"
              alt="Occulta logo"
              width={160}
              height={80}
              className="w-auto h-8 sm:h-10"
            />
          </Link>
          <Link href="/" className="text-sm text-purple-400 hover:underline">
            ← Back to feed
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-purple-300 mb-4">Unsubscribe</h1>
        <p className="text-gray-300 mb-6 text-base leading-relaxed">
          We're sorry to see you go. Enter your email below to permanently remove yourself from our list.
        </p>

        <form onSubmit={handleUnsubscribe} className="flex flex-col sm:flex-row items-center gap-3">
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
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
          >
            Unsubscribe
          </button>
        </form>

        {status === 'success' && <p className="text-green-400 mt-3">✅ You have been unsubscribed.</p>}
        {status === 'error' && <p className="text-red-400 mt-3">❌ There was a problem unsubscribing.</p>}
      </div>
    </main>
  )
}
