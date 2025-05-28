import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, subreddits, query } = await req.json()
    console.log('📥 Request body:', { userId, subreddits })

    if (!userId || !Array.isArray(subreddits)) {
      console.error('❌ Invalid input')
      return NextResponse.json({ error: 'Missing or invalid userId or subreddits' }, { status: 400 })
    }

    const scraperUrl = process.env.SCRAPER_URL
    if (!scraperUrl) {
      console.error('❌ SCRAPER_URL is undefined')
      return NextResponse.json({ error: 'SCRAPER_URL is not configured' }, { status: 500 })
    }

    const response = await fetch(scraperUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, subreddits, query })
    })

    const data = await response.json()
    console.log('✅ Scraper response:', data)

    if (!response.ok) {
      console.error('❌ Scraper returned non-OK status')
      return NextResponse.json({ error: 'Scraper failed', details: data }, { status: 500 })
    }

    return NextResponse.json({ success: true, insights: data })
  } catch (err: any) {
    console.error('🔥 Unexpected error:', err.stack || err.message || err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
