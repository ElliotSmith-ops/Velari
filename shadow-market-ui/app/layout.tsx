import './globals.css'
import { DM_Mono } from 'next/font/google'
import Image from 'next/image'


const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata = {
  title: 'Occulta – Shadow Market',
  description: 'Live radar of emerging startup opportunities before they go mainstream.',
  openGraph: {
    title: 'Occulta – Shadow Market',
    description: 'Live radar of emerging startup opportunities before they go mainstream.',
    url: 'https://occulta.ai',
    siteName: 'Occulta',
    images: [
      {
        url: 'https://occulta.ai/occulta-tinylogo.png', // Make sure this image exists in /public
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
    title: 'Occulta – Shadow Market',
    description: 'Discover rising startup trends in real-time.',
    images: ['https://occulta.ai/occulta-tinylogo.png'],
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
