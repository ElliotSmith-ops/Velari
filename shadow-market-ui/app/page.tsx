'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'
import SubscribeForm from '@/components/SubscribeForm'
import { Button } from '@/components/ui/button'
import ShareButton from '@/components/ShareButton'
import { useMemo } from 'react'
import Head from 'next/head'
import SeoHead from '@/components/SeoHead'




type Insight = {
  id: string
  post_id: string | null
  signal: string
  why_it_matters: string
  action_angle: string
  urgency_score: number
  novelty_score: number
  tone: string
  sector: string
  created_at: string
  interesting_score: number
}

export default function Home() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [sector, setSector] = useState('')
  const [tone, setTone] = useState('')
  const [search, setSearch] = useState('')
  const [minUrgency, setMinUrgency] = useState(1)
  const [minNovelty, setMinNovelty] = useState(1)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [sortField, setSortField] = useState('interesting_score')
  const router = useRouter()
  const sectors = ['ecommerce', 'SaaS', 'creator', 'health', 'other']
const tones = ['curious', 'frustrated', 'excited', 'reflective']

useEffect(() => {
  if (window.innerWidth < 768) {
    router.replace('/m')
  }
}, [])


useEffect(() => {
  const savedY = sessionStorage.getItem('scroll-position')
  if (savedY) {
    window.scrollTo({ top: parseInt(savedY), behavior: 'auto' })
  }
}, [])

const sortOptions = [
  { label: 'Default', value: 'interesting_score' },
  { label: 'Urgency', value: 'urgency_score' },
  { label: 'Novelty', value: 'novelty_score' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('subscribers').insert({ email })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setEmail('')
    }
  }

  useEffect(() => {
    const fetchInsights = async () => {
      let query = supabase
        .from('insights')
        .select('*')
        .is('custom_query', null) // only return insights where custom_query is null
        .order(sortField, { ascending: false })
  
      if (sector) query = query.eq('sector', sector)
      if (tone) query = query.eq('tone', tone)
      
        console.log('🔍 Querying with:', { sector, tone, sortField })

      const { data, error } = await query.limit(200)
  
      if (error || !data) {
        console.error('❌ Error fetching insights:', error)
        setInsights([])
        return
      }
  
      const filtered = data.filter(i =>
        i.urgency_score >= minUrgency &&
        i.novelty_score >= minNovelty &&
        (
          i.signal.toLowerCase().includes(search.toLowerCase()) ||
          i.why_it_matters.toLowerCase().includes(search.toLowerCase()) ||
          i.action_angle.toLowerCase().includes(search.toLowerCase())
        )
      )
  
      setInsights(filtered)
    }
  
    fetchInsights()
  }, [sector, tone, search, minUrgency, minNovelty, sortField])

  return (
    <>
<SEOHead
  title="SurfRider – AI Startup Idea Generator"
  description="Discover high-potential startup ideas using AI-curated insights from the internet. SurfRider helps founders move faster by identifying emerging market signals."
  keywords="AI startup ideas, Reddit trend analysis, discover startup ideas, founder tools, market demand signals, product validation AI"
  url="https://surfrider.io"
  image="https://surfrider.io/og.png"
/>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-800" />
      <main className="min-h-screen max-w-6xl mx-auto w-full px-4 sm:px-6 text-white">

        {/* Hero Section */}
        <section className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-10 pt-6 pb-12">
          <div className="flex-1 min-w-[300px]">
            <Image
              src="/surfrider-logo.png"
              alt="SurfRider"
              width={300}
              height={100}
              className="h-20 w-auto mx-auto sm:mx-0"
              priority
            />
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-snug">
              <span className="text-purple-400"   style={{ fontFamily: 'var(--font-modern)' }}
              >Trends rise fast.</span><br />
              <span className="text-white"   style={{ fontFamily: 'var(--font-modern)' }}
              >SurfRider moves faster.</span>
            </h1>
            <p className="mt-3 text-gray-400 text-base sm:text-lg max-w-xl" >
              Arming founders, investors, and builders with real-time, AI-curated <span
  className="underline decoration-dotted text-white cursor-help relative group"
>
  signals
  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-zinc-900 text-gray-300 text-xs p-3 rounded-lg border border-zinc-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
  Signals are whispers of product demand, market shifts, and consumer frustration points from the internet's edge — we turn them into launch ideas.
  </span>
</span> from the internet’s raw frontier.
            </p>
          </div>
          <div className="flex flex-col flex-shrink-0 w-full sm:w-auto mt-2">
  <div className="flex flex-col items-center text-center">
  <Link href="/pro">
  <div className="relative w-40 h-24 mb-3 cursor-pointer hover:opacity-90 transition">
    <Image
      src="/surfriderpro-logo.png"
      alt="SurfRider Pro Logo"
      fill
      className="object-contain"
      priority
    />
  </div>
</Link>
<button
  onClick={() => {   sessionStorage.setItem('scroll-position', window.scrollY.toString())
     router.push('/pro')}}
  className="cursor-pointer bg-black px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
>
  <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent" style={{ fontFamily: 'Klavika, sans-serif' }}>
    Try for free / Sign in
  </span>
</button>
  </div>
</div>

        </section>

        {/* Subscribe */}
        <section className="py-10 border-t border-zinc-700">
          <div className="mt-1 max-w-xl text-center lg:text-left mx-auto">
            <h2 className="text-xl font-bold mb-2 text-white hover:underline cursor-pointer"   style={{ fontFamily: 'var(--font-modern)' }}
            >
              <Link href="/subscribe">📬 Stay in the loop</Link>
            </h2>
            <p className="text-sm text-gray-400 mb-4"   style={{ fontFamily: 'var(--font-modern)' }}
            >Subscribe for top insights delivered daily.</p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm w-full"
              />
              <Button type="submit" className="text-sm px-4 py-2">Subscribe</Button>
            </form>
            {status === 'success' && <p className="text-green-400 mt-2">✅ Subscribed!</p>}
            {status === 'error' && <p className="text-red-400 mt-2">❌ Something went wrong.</p>}
          </div>
        </section>



  {/* Tone Filters */}
<div className="flex flex-wrap gap-4 items-center justify-center mb-6 w-full">
  {/* Search Input */}
  <input
    type="text"
    placeholder="Search insights..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-64"
  />

  {/* Sector Dropdown */}
  <select
    value={sector}
    onChange={(e) => setSector(e.target.value)}
    className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-48"
  >
    <option value="">All Sectors</option>
    <option value="Ecommerce">Ecommerce</option>
    <option value="SaaS">SaaS</option>
    <option value="Creator Tools">Creator Tools</option>
    <option value="Health">Health</option>
    <option value="AI">AI</option>
    <option value="Education">Education</option>
    <option value="Finance">Finance</option>
    <option value="Consumer">Creator Tools</option>
    <option value="Other">Other</option>
  </select>

  {/* Tone Dropdown */}
  <select
    value={tone}
    onChange={(e) => setTone(e.target.value)}
    className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-48"
  >
    <option value="">All Tones</option>
    <option value="Curious">Curious</option>
    <option value="Frustrated">Frustrated</option>
    <option value="Excited">Excited</option>
    <option value="Reflective">Reflective</option>
    <option value="Skeptical">Skeptical</option>
    <option value="Hopeful">Hopeful</option>
    <option value="Sarcastic">Sarcastic</option>
  </select>

  {/* Sort Dropdown */}
  <select
    value={sortField}
    onChange={(e) => setSortField(e.target.value)}
    className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-40"
  >
    <option value="interesting_score">Sort: Default</option>
    <option value="urgency_score">Sort: Urgency</option>
    <option value="novelty_score">Sort: Novelty</option>
  </select>
</div>

<div className="mt-4 mb-4 flex justify-center">
  <p
    className="text-center text-base sm:text-md text-white font-semibold tracking-wide"
    style={{ fontFamily: 'var(--font-orbitron)' }}
  >
    Looking for custom signals?{' '}
    <Link href="/pro" className="relative group">
      <span className="rainbow-text-underline">Try Pro</span>
    </Link>{' '}
    — search anything, we’ll generate your next million dollar idea.
  </p>

  <style jsx>{`
    .rainbow-text-underline {
      background: linear-gradient(
        270deg,
        #ff6ec4,
        #7873f5,
        #4ade80,
        #facc15,
        #ff6ec4
      );
      background-size: 300% 300%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: rainbowShift 5s ease infinite;
      position: relative;
      font-weight: bold;
    }

    .rainbow-text-underline::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      height: 2px;
      width: 100%;
      background: inherit;
      background-clip: border-box;
      animation: rainbowShift 5s ease infinite;
    }

    @keyframes rainbowShift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `}</style>
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              onClick={() => {  sessionStorage.setItem('scroll-position', window.scrollY.toString())
                router.push(`/signal?id=${insight.id}`)}}
              className="w-full rounded-xl border border-purple-500 bg-zinc-900/80 p-6 shadow-md hover:shadow-lg transition cursor-pointer group"
              style={{ fontFamily: 'var(--font-modern)' }}
            >
              <h2 className="text-xl font-bold text-purple-200 mb-3 break-words">
                 {insight.signal} <span aria-hidden>↗</span>
              </h2>
              <p className="text-sm text-zinc-400 mt-3 break-words">
                <strong className="text-white"> Why It Matters:</strong> {insight.why_it_matters}
              </p>
              <p className="text-sm text-zinc-400 mt-3 break-words">
                <strong className="text-white"> Action Angle:</strong> {insight.action_angle}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mt-4 items-center">
                <span className="neon-tag">{insight.sector}</span>
                <span className="neon-tag"> Tone: {insight.tone}</span>
                <span className="neon-tag"> Urgency: {insight.urgency_score}</span>
                <span className="neon-tag"> Novelty: {insight.novelty_score}</span>
                <span className="neon-tag">{new Date(insight.created_at).toLocaleDateString()}</span>
                {insight.post_id && (
                  <a
                    href={insight.post_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="blue-neon-tag hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                     Insight Origin
                  </a>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  <CopyButton
                    text={` ${insight.signal}\n\n Why It Matters: ${insight.why_it_matters}\n\n Action Angle: ${insight.action_angle}\n\nhttps://occulta.ai/signal/${insight.id}`}
                  />
                </div>
                <div className="flex justify-between items-start">
                <ShareButton insight={{ id: insight.id, signal: insight.signal }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
