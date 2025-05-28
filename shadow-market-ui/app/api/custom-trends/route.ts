// File: app/api/custom-trends/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { query, userId } = await req.json()

    if (!query || !userId) {
      return NextResponse.json({ error: 'Missing query or userId' }, { status: 400 })
    }

    const prompt = `Identify 5 of the most relevant subreddits to find discussions related to the following trend:
"${query}"

Respond as a plain array of subreddit names like ["example1", "example2"]`

    const chat = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    })

    const content = chat.choices[0].message.content.trim()
    const subreddits = JSON.parse(content)

    return NextResponse.json({ subreddits })
  } catch (error) {
    console.error('❌ Custom trend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
