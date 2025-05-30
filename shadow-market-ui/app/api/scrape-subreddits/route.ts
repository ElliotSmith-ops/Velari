import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, subreddits, query } = await req.json()
    console.log('📥 Request body:', { userId, subreddits, query })

    if (!userId || !Array.isArray(subreddits) || !query) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const scraperUrl = process.env.SCRAPER_URL
    if (!scraperUrl) {
      return NextResponse.json({ error: 'SCRAPER_URL is not set' }, { status: 500 })
    }

    const response = await fetch(scraperUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, subreddits, query })
    })

    if (!response.ok) {
      const text = await response.text()
      console.warn('⚠️ Scraper returned non-OK status:', response.status)
      console.warn('🧾 Full error response:', text.slice(0, 500))
      return NextResponse.json({ error: 'Scraper failed', status: response.status, text }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('🔥 Unexpected error:', err.stack || err.message || err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
