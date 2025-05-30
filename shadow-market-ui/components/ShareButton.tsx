'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import ShareModal from '@/components/Share/ShareModal'


export default function ShareButton({ insight }: { insight: { id: string, signal: string } }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
<button
  onClick={(e) => {
    e.stopPropagation() // <-- prevents the click from reaching the card
    setIsOpen(true)
  }}
  className="text-zinc-400 hover:text-white transition cursor-pointer"
>
  <Share2 size={16} />
</button>
      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        insight={insight}
      />
    </>
  )
}

