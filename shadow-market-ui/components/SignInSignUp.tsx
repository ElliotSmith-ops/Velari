'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function SignInSignUp() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signUp') {
        const { data, error } = await supabase
          .from('users')
          .insert([{ username, password, credits: 1 }])
          .select()
          .single()

        if (error) {
          setMessage('Sign up failed: ' + error.message)
          return
        }

        localStorage.setItem('fake_user', JSON.stringify(data))
        window.location.reload()
      } else {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single()

        if (error) {
          setMessage('Sign in failed: ' + error.message)
          return
        }

        localStorage.setItem('fake_user', JSON.stringify(data))
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      setMessage('❌ Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative">
      
      {/* Top-left icon */}
      <Link href="/" className="absolute top-4 left-4 w-12 sm:w-14 z-50">
        <Image
          src="/surfrider-icon.png"
          alt="SurfRider Icon"
          width={48}
          height={48}
          className="w-full h-auto object-contain"
          priority
        />
      </Link>

      <div className="w-full max-w-md space-y-8 pt-12 pb-10">
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/surfriderpro-logo.png"
            alt="Surfrider Logo"
            width={160}
            height={100}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-white">
            {mode === 'signUp' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {mode === 'signUp'
              ? 'Join SurfRider Pro and get 1 free credit'
              : 'Sign in to access Pro insights'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4 bg-zinc-900/80 p-6 rounded-xl border border-zinc-700 shadow-md">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-zinc-600 bg-zinc-800 text-white"
          />
          <input
            type="password"
            placeholder="Password"
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
            {loading ? 'Loading...' : mode === 'signUp' ? 'Sign Up' : 'Sign In'}
          </button>

          {message && <p className="text-sm text-center mt-2 text-purple-300">{message}</p>}
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-sm text-gray-400">
          {mode === 'signUp' ? (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('signIn')} className="text-blue-400 hover:underline">
                Sign In
              </button>
            </>
          ) : (
            <>
              Need an account?{' '}
              <button onClick={() => setMode('signUp')} className="text-blue-400 hover:underline">
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* What is SurfRider Pro */}
        <div className="mt-10 text-center border-t border-zinc-700 pt-6">
          <h2 className="text-xl font-semibold text-white mb-2">What is SurfRider Pro?</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            SurfRider Pro lets you scan the internet with AI for trends on anything you’re curious about — startups, side hustles, crypto, creator tools, even fan theories. Submit a query and we’ll handle the rest.
            <br />
            <br />
            🆓 New users get <strong className="text-white">1 free credit</strong> to try it out!
          </p>
        </div>
      </div>
    </div>
  )
}
