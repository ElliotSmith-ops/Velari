import Head from 'next/head'

type Props = {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
}

export default function SEOHead({ title, description, keywords, image, url }: Props) {
  const siteName = 'SurfRider'
  const siteUrl = url || 'https://surfrider.io'
  const ogImage = image || 'https://surfrider.io/og.png' // Replace with your default OG image

  return (
    <Head>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

    </Head>
  )
}
