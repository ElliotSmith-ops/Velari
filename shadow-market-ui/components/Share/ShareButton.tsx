'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { toast } from 'react-hot-toast'
import { Copy, Twitter, Linkedin, Reddit } from 'lucide-react'

export default function ShareModal({ isOpen, onClose, insight }: {
  isOpen: boolean
  onClose: () => void
  insight: {
    id: string
    signal: string
  }
}) {
  const url = `https://surfrider.io/insight/${insight.id}`
  const encoded = encodeURIComponent(insight.signal)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    toast.success('✅ Link copied to clipboard')
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 text-white p-6 shadow-lg space-y-6">
          <Dialog.Title className="text-lg font-bold">📤 Share this insight</Dialog.Title>
          <div className="space-y-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md"
            >
              <Copy size={18} /> Copy link
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encoded}&url=${url}`}
              target="_blank"
              className="flex items-center gap-2 w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
              rel="noopener noreferrer"
            >
              <Twitter size={18} /> Tweet this
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
              target="_blank"
              className="flex items-center gap-2 w-full bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md"
              rel="noopener noreferrer"
            >
              <Linkedin size={18} /> Share on LinkedIn
            </a>

            <a
              href={`https://www.reddit.com/submit?url=${url}&title=${encoded}`}
              target="_blank"
              className="flex items-center gap-2 w-full bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md"
              rel="noopener noreferrer"
            >
              <Reddit size={18} /> Post on Reddit
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full text-sm text-zinc-400 hover:text-white mt-4"
          >
            Cancel
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
