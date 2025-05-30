import { Suspense } from 'react'
import ClientRedirect from './ClientRedirect'

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<p className="text-white text-lg">Loading...</p>}>
        <ClientRedirect />
      </Suspense>
    </main>
  )
}
