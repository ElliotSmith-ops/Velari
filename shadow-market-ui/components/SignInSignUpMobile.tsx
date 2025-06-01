'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function SignInSignUpMobile() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signUp') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://surfrider.io/pro',
          },
        })

        if (error) {
          setMessage('❌ Sign up failed: ' + error.message)
        } else {
          setMessage('✅ Check your email to confirm your account and claim your free credit.')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          setMessage('❌ Sign in failed: ' + error.message)
        } else {
          localStorage.setItem('fake_user', JSON.stringify(data.user))
          window.location.reload()
        }
      }
    } catch (err) {
      console.error(err)
      setMessage('❌ Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://surfrider.io/reset-password',
    })
    if (error) {
      setMessage('❌ ' + error.message)
    } else {
      setMessage('✅ Check your email for the reset link.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen px-4 pt-10 pb-20 text-white flex flex-col gap-6 items-center">
      <Link href="/" className="absolute top-4 left-4">
        <Image src="/surfrider-icon.png" alt="Logo" width={40} height={40} />
      </Link>

      <Image src="/surfriderpro-logo.png" alt="Pro Logo" width={160} height={40} priority />

      <h1 className="text-xl font-bold text-center">
        {forgotMode
          ? 'Reset Your Password'
          : mode === 'signUp'
          ? 'Create Your Account'
          : 'Welcome Back'}
      </h1>

      <p className="text-sm text-gray-400 text-center">
        {forgotMode
          ? 'We’ll send a reset link to your email'
          : mode === 'signUp'
          ? 'Join SurfRider Pro and check your inbox'
          : 'Sign in to access Pro insights'}
      </p>

      <form
        onSubmit={forgotMode ? handleReset : handleAuth}
        className="w-full max-w-xs bg-zinc-900/80 p-5 rounded-xl border border-zinc-700 flex flex-col gap-4 shadow"
      >
        <input
          type="email"
          placeholder="Email"
          required
          className="bg-zinc-800 text-white px-4 py-2 rounded-md border border-zinc-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!forgotMode && (
          <input
            type="password"
            placeholder="Password"
            required
            className="bg-zinc-800 text-white px-4 py-2 rounded-md border border-zinc-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 rounded-md py-2 font-semibold"
        >
          {loading
            ? 'Loading...'
            : forgotMode
            ? 'Send Reset Link'
            : mode === 'signUp'
            ? 'Sign Up'
            : 'Sign In'}
        </button>
      </form>

      {message && (
        <p className="text-sm text-center text-zinc-300 whitespace-pre-wrap max-w-xs">{message}</p>
      )}

      <div className="text-sm text-center text-zinc-400">
        {!forgotMode ? (
          <>
            {mode === 'signUp' ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('signIn')} className="text-blue-400 underline">
                  Sign In
                </button>
              </>
            ) : (
              <>
                No account yet?{' '}
                <button onClick={() => setMode('signUp')} className="text-blue-400 underline">
                  Sign Up
                </button>
              </>
            )}
            <br />
            <button onClick={() => setForgotMode(true)} className="text-blue-400 mt-1 underline">
              Forgot password?
            </button>
          </>
        ) : (
          <button onClick={() => setForgotMode(false)} className="text-blue-400 underline">
            ← Back to Sign In
          </button>
        )}
      </div>

      <div className="border-t border-zinc-700 pt-6 mt-8 text-sm text-zinc-400 max-w-xs text-center">
        <h2 className="text-white font-semibold mb-2">What is SurfRider Pro?</h2>
        <p>
          SurfRider Pro lets you scan the internet with AI for trends on anything you're curious about — startups, side hustles, crypto, and more.
          <br />
          <br />🆓 New users get <strong className="text-white">1 free credit</strong> to try it out!
        </p>
      </div>
    </main>
  )
}
