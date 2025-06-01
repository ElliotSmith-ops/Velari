'use client'

import { useState } from 'react'

type Props = {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
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
  onClick={(e) => {
    e.stopPropagation() // Prevents parent click
    handleCopy()
  }}
  className="blue-neon-tag text-blue-400 border-blue-400 hover:bg-blue-500/10 transition w-full sm:w-auto group"
>
      {copied ? '✅ Copied!' : (
        <span className="group-hover:underline">📋 Copy</span>
      )}
    </button>
  )
}
