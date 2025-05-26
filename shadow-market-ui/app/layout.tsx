import './globals.css'
import { DM_Mono } from 'next/font/google'
import Image from 'next/image'


const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata = {
  title: 'Occulta - AI startup signals',
  description: 'Live radar of emerging startup opportunities before they go mainstream.',
  openGraph: {
    title: 'Occulta – AI trend finder',
    description: 'Live radar of emerging startup opportunities before they go mainstream.',
    url: 'https://occulta.ai',
    siteName: 'Occulta',
    images: [
      {
        url: 'https://occulta.ai/og-logo.png', // Make sure this image exists in /public
        width: 1200,
        height: 630,
        alt: 'Occulta logo glowing on black background',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Occulta – AI trend finder',
    description: 'Discover rising startup trends in real-time.',
    images: ['https://occulta.ai/og-logo.png'],
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className={`${dmMono.className} overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
