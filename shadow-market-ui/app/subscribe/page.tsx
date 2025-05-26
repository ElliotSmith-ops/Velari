// app/subscribe/page.tsx

import Link from 'next/link'
import Image from 'next/image'
import SubscribeForm from '@/components/SubscribeForm'



export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-xl border border-purple-500 bg-zinc-900/80 p-8 shadow-lg">
        {/* LOGO + Back Link */}
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

        {/* Content */}
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-300 mb-4">
          Subscribe to Occulta
        </h1>
        <p className="text-gray-300 mb-5 text-base leading-relaxed">
          Occulta scans Reddit to detect rising startup trends before they go mainstream. Get the best 3–5 insights delivered to your inbox every morning.
        </p>

        <ul className="mb-6 text-gray-400 list-disc list-inside space-y-2">
          <li>🧠 High-signal insights only</li>
          <li>🚨 Real-time pain points and product demand</li>
          <li>💡 Urgency + Novelty scoring</li>
          <li>📬 No fluff. Just gold.</li>
        </ul>

        <SubscribeForm />
      </div>
    </main>
  )
}
