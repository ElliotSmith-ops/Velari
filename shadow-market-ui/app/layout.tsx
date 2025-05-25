import './globals.css'
import { DM_Mono } from 'next/font/google'
import Image from 'next/image'


const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata = {
  title: 'Shadow Market',
  description: 'Live radar of emerging startup opportunities',
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
