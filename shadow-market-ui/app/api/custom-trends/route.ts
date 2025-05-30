// File: app/api/custom-trends/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
    try {
      const body = await req.json()
  
      if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }
  
      const { query, userId } = body
  
      if (!query || !userId) {
        return NextResponse.json({ error: 'Missing query or userId' }, { status: 400 })
      }
  
      const prompt = `Identify 5 of the most relevant, active, and public subreddits where people discuss topics related to the following subject:

"${query}"

Focus on subreddits that:
- Are currently active (recent posts in the past month)
- Are public and not restricted or banned
- Attract discussion from real users, not just news/link dumps
- Are relevant even for complex or niche topics

Return only the subreddit names as a plain lowercase array like:
["example1", "example2", "example3", "example4", "example5"]`
  
      const chat = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      })
  
      const content = chat.choices?.[0]?.message?.content?.trim()

      if (!content) {
      return NextResponse.json({ error: 'No content returned from OpenAI' }, { status: 500 })
      }

      const subreddits = JSON.parse(content)
  
      return NextResponse.json({ subreddits })
    } catch (error) {
      console.error('❌ Custom trend error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
