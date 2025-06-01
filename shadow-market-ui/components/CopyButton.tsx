// components/CopyButton.tsx
'use client'

import { useState } from 'react'
import { ClipboardCopy, Check } from 'lucide-react'

type Props = {
  text: string
}

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('❌ Failed to copy')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-zinc-400 hover:text-white transition cursor-pointer"
      title="Copy insight"
    >
      {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
    </button>
  )
}
