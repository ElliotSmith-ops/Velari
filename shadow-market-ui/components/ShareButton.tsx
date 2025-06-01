'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import ShareModal from '@/components/Share/ShareModal'

type ShareButtonProps = {
  insight: { id: string; signal: string }
  className?: string
  children?: React.ReactNode // <- add this
}

export default function ShareButton({ insight, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
<button
  onClick={(e) => {
    e.stopPropagation()
    setIsOpen(true)
  }}
  className={className}
  title="Share insight"
>
  {children ?? <Share2 size={16} />}
</button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        insight={insight}
      />
    </>
  )
}
