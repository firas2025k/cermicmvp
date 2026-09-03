import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerSideURL().replace(/\/$/, '')

  return {
    host: baseUrl,
    rules: [
      {
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api',
          '/api/',
          '/account',
          '/account/',
          '/orders',
          '/orders/',
          '/checkout',
          '/checkout/',
          '/cart',
          '/cart/',
          '/login',
          '/create-account',
          '/forgot-password',
          '/logout',
          '/find-order',
          '/newsletter',
          '/newsletter/',
          '/next/',
        ],
        userAgent: '*',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
