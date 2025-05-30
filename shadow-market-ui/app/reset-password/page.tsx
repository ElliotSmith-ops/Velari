'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        setErrorMsg('⚠️ Invalid or expired reset link.')
        setStatus('error')
      }
    }
    getSession()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setStatus('idle')

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => router.push('/pro'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950 text-white">
      <div className="w-full max-w-md border-2 rounded-xl border-transparent bg-zinc-900 p-6 shadow-lg"
        style={{
          borderImage: 'linear-gradient(to right, #ec4899, #f59e0b, #3b82f6) 1',
        }}
      >
        <div className="flex justify-center mb-6">
          <Image
            src="/surfriderpro-logo.png"
            alt="SurfRider Pro Logo"
            width={180}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">🔐 Reset Your Password</h1>
        <p className="text-sm text-center text-zinc-400 mb-6">
          Set a new password and you’ll be back exploring trends in no time.
        </p>

        {status === 'success' ? (
          <p className="text-green-400 text-center text-sm">✅ Password updated! Redirecting…</p>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-zinc-600 bg-zinc-800 text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
            {status === 'error' && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
