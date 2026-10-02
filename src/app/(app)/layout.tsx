import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { CookieConsent } from '@/components/CookieConsent'
import { Footer } from '@/components/Footer'
import { GoogleAnalyticsGate } from '@/components/GoogleAnalytics'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getSiteJsonLd } from '@/utilities/siteJsonLd'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import React from 'react'
import './globals.css'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Nabea'
const DEFAULT_DESCRIPTION =
  'Handgefertigte Olivenholzprodukte von Nabea – nachhaltig gefertigt in Österreich, Versand aus Wien.'

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  openGraph: mergeOpenGraph({
    description: DEFAULT_DESCRIPTION,
    locale: 'de_AT',
    title: SITE_NAME,
    url: '/',
  }),
  other: {
    'content-language': 'de-AT',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: `${SITE_NAME} | Handgefertigte Olivenholzprodukte`,
    template: `%s | ${SITE_NAME}`,
  },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const siteJsonLd = getSiteJsonLd()

  return (
    <html
      className={[GeistSans.variable, GeistMono.variable].filter(Boolean).join(' ')}
      lang="de"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
          type="application/ld+json"
        />
      </head>
      <body>
        <Providers>
          <AdminBar />
          <LivePreviewListener />

          <Header />
          <main>{children}</main>
          <Footer />
          <CookieConsent />
          <GoogleAnalyticsGate />
        </Providers>
      </body>
    </html>
  )
}
