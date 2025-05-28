import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId, query } = await req.json()

    if (!userId || !query) {
      return NextResponse.json({ error: 'Missing userId or query' }, { status: 400 })
    }

    const scraperRes = await fetch(process.env.SCRAPER_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, query })
    })

    const data = await scraperRes.json()

    if (!scraperRes.ok) {
      console.error('❌ Scraper error:', data)
      return NextResponse.json({ error: 'Scraper failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, insights: data })
  } catch (err) {
    console.error('❌ Internal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
