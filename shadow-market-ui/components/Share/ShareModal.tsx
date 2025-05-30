'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { toast } from 'react-hot-toast'
import { Copy, Twitter, Linkedin, Reddit } from 'lucide-react'

const RedditIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M440.2 202.2c-17.7 0-32 14.3-32 32 0 5.1 1.2 9.9 3.3 14.2-23.4 19.1-55.2 31.3-90.6 33.2-7.7-6.3-17.9-10.2-29-10.2-11.1 0-21.3 3.9-29 10.2-35.4-2-67.2-14.1-90.6-33.2 2.1-4.3 3.3-9.1 3.3-14.2 0-17.7-14.3-32-32-32s-32 14.3-32 32c0 12.1 6.8 22.7 16.8 28.4-1.2 5.6-1.8 11.3-1.8 17.1 0 66.3 71.6 120 160 120s160-53.7 160-120c0-5.8-.6-11.5-1.8-17.1 10-5.7 16.8-16.3 16.8-28.4 0-17.7-14.3-32-32-32zM160 272c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm96 96c-31.8 0-60-14.3-78.6-37.1 13.3 5.1 27.9 8.1 43.6 8.1h70c15.7 0 30.3-3 43.6-8.1-18.6 22.8-46.8 37.1-78.6 37.1zm96-64c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z" />
      <circle cx="256" cy="256" r="256" fill="none" />
    </svg>
  )

export default function ShareModal({ isOpen, onClose, insight }: {
  isOpen: boolean
  onClose: () => void
  insight: {
    id: string
    signal: string
  }
}) {
  const url = `https://surfrider.io/signal?id=${insight.id}`
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
              <RedditIcon /> Post on Reddit

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
