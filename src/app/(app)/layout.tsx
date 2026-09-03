import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
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
  'Handgefertigte Olivenholzprodukte und Keramik von Nabea – aus Österreich.'

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  description: DEFAULT_DESCRIPTION,
  openGraph: mergeOpenGraph({
    description: DEFAULT_DESCRIPTION,
    title: SITE_NAME,
    url: '/',
  }),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
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
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
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
        </Providers>
      </body>
    </html>
  )
}
