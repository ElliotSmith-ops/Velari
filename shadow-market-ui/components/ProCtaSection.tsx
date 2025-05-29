'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function ProCtaSection() {
  const router = useRouter()

  return (
    <section className="flex flex-col sm:flex-row justify-between items-center px-6 py-6 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-md mt-10 mb-8">


      {/* Right: CTA */}
      <div className="text-center sm:text-right">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Want sharper signals?</h2>
        <p className="text-sm text-gray-400 mt-1 mb-3">Get AI-curated trend alerts tailored to your niche.</p>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-xl shadow hover:scale-105 transition"
          onClick={() => router.push('/pro')}
        >
          ⚡ Try SurfRider Pro →
        </Button>
        <p className="text-xs text-gray-500 mt-2">Trusted by indie hackers & builders worldwide.</p>
      </div>
    </section>
  )
}
