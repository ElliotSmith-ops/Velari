import { Suspense } from 'react'
import SignalClientPage from './SignalClientPage'
import SEOHead from '@/components/SEOHead'


export default function SignalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen text-white p-10">Loading signal...</div>}>
      <SignalClientPage />
    </Suspense>
  )
}
