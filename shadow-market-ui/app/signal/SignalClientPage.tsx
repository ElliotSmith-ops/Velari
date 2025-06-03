'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CopyButton from '@/components/CopyButton'
import Link from 'next/link'
import Image from 'next/image'
import ShareButton from '@/components/ShareButton'
import SEOHead from '@/components/SEOHead'



export default function SignalClientPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [insight, setInsight] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchInsight = async () => {
      const { data: insightData, error } = await supabase
        .from('insights')
        .select('*')
        .eq('id', id)
        .single()

      if (!insightData || error) {
        setInsight(null)
        setLoading(false)
        return
      }

      setInsight(insightData)

      const { data: relatedData } = await supabase
        .from('insights')
        .select('*')
        .neq('id', id)
        .or(`sector.eq.${insightData.sector},tone.eq.${insightData.tone}`)
        .limit(3)

      setRelated(relatedData || [])
      setLoading(false)
    }

    fetchInsight()
  }, [id])

  if (!id) {
    return <main className="min-h-screen text-white p-10">❌ No signal ID provided in URL.</main>
  }

  if (loading) {
    return <main className="min-h-screen text-white p-10">Loading...</main>
  }

  if (!insight) {
    return <main className="min-h-screen text-white p-10">❌ Signal not found.</main>
  }
  


  const copyText = `🔍 ${insight.signal}\n\n🧨 Why It Matters: ${insight.why_it_matters}\n\n🛠 Action Angle: ${insight.action_angle}\n\nhttps://occulta.ai/signal?id=${id}`

  return (
    <>
    <SEOHead
      title={`"${insight.signal}" – Startup Signal | SurfRider`}
      description={`Why it matters: ${insight.why_it_matters} | Action: ${insight.action_angle}`}
      keywords={`startup ideas, ${insight.sector}, ${insight.tone}, SurfRider insight, urgency ${insight.urgency_score}, novelty ${insight.novelty_score}, ${insight.signal}`}
      url={`https://surfrider.io/signal?id=${insight.id}`}
    />
    <main className="min-h-screen max-w-3xl mx-auto w-full px-4 sm:px-6 text-white py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3 sm:gap-0">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/surfrider-logo.png"
            alt="surfrider logo"
            width={160}
            height={80}
            className="w-auto h-8 sm:h-10"
          />
        </Link>
        <Link href="/" className="text-sm text-purple-400 hover:underline">
          ← Back to feed
        </Link>
      </div>

      <div className="w-full rounded-xl border border-purple-500 bg-zinc-900/80 p-6 shadow-md overflow-hidden mb-10"
        style={{ fontFamily: 'var(--font-modern)' }}
>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-200 mb-4 break-words">
          {insight.signal}
        </h1>

        <p className="text-sm text-zinc-400 mb-3">
          <strong className="text-white"> Why It Matters:</strong> {insight.why_it_matters}
        </p>

        <p className="text-sm text-zinc-400 mb-5">
          <strong className="text-white"> Action Angle:</strong> {insight.action_angle}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 mb-6">
          <span className="neon-tag">{insight.sector}</span>
          <span className="neon-tag"> Tone: {insight.tone}</span>
          <span className="neon-tag"> Urgency: {insight.urgency_score}</span>
          <span className="neon-tag"> Novelty: {insight.novelty_score}</span>
          <span className="neon-tag">
            {new Date(insight.created_at).toLocaleDateString()}
          </span>
          {insight.post_id && (
            <a
              href={insight.post_id}
              target="_blank"
              rel="noopener noreferrer"
              className="blue-neon-tag hover:underline"
            >
               Insight Origin
            </a>
          )}
        </div>

        <CopyButton text={copyText} />

        <ShareButton insight={{ id: insight.id, signal: insight.signal }} />
        
      </div>

      {related && related.length > 0 && (
        <div>
          <h2 className="text-lg text-purple-300 font-semibold mb-4">
            Related Signals
          </h2>
          <div className="grid gap-4 sm:grid-cols-2"
            style={{ fontFamily: 'var(--font-modern)' }}
>
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/signal?id=${item.id}`}
                className="block rounded-xl border border-purple-500 bg-zinc-900/70 p-4 hover:bg-zinc-800 transition"
              >
                <h3 className="text-sm font-bold text-purple-200 mb-2">
                  {item.signal}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-3">
                  {item.why_it_matters}
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 mt-3">
                  <span className="neon-tag">{item.sector}</span>
                  <span className="neon-tag">Urgency: {item.urgency_score}</span>
                  <span className="neon-tag">Novelty: {item.novelty_score}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
    </>
  )
}
