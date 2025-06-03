import './globals.css'
import { DM_Mono } from 'next/font/google'
import Image from 'next/image'
import { Toaster } from 'react-hot-toast'

const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata = {
  title: 'SurfRider - Startup Signals powered by AI',
  description: 'Live radar of emerging startup opportunities before they go mainstream.',
  openGraph: {
    title: 'SurfRider – Startup Signals powered by AI',
    description: 'Live radar of emerging startup opportunities before they go mainstream.',
    url: 'https://surfrider.io',
    siteName: 'SurfRider',
    images: [
      {
        url: 'https://surfrider.io/surfridericonblack.png',
        width: 1200,
        height: 630,
        alt: 'Surfrider logo glowing on black background',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SurfRider – Startup Signals powered by AI',
    description: 'Discover rising business opportunities in real-time.',
    images: ['https://surfrider.io/surfridericonblack.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Optional: Support for PNG or SVG */}
        {/* <link rel="icon" type="image/png" href="/favicon.png" /> */}
      </head>
      <body className={`${dmMono.className} overflow-x-hidden`}>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}
