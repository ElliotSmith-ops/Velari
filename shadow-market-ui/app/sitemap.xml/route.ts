import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: insights } = await supabase.from('insights').select('id')

  const dynamicUrls = insights?.map((i) => `
    <url>
      <loc>https://surfrider.io/signal?id=${i.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('') || ''

  const staticUrls = [
    { loc: 'https://surfrider.io/', priority: 1.0, freq: 'daily' },
    { loc: 'https://surfrider.io/m', priority: 1.0, freq: 'daily' },
    { loc: 'https://surfrider.io/pro', priority: 0.9, freq: 'weekly' },
    { loc: 'https://surfrider.io/m/pro', priority: 0.9, freq: 'weekly' },
    { loc: 'https://surfrider.io/account', priority: 0.8, freq: 'monthly' },
  ]

  const staticXml = staticUrls.map(({ loc, priority, freq }) => `
    <url>
      <loc>${loc}</loc>
      <changefreq>${freq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticXml}
    ${dynamicUrls}
  </urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
