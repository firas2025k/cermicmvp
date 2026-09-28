import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

const PRIVATE_DISALLOW = [
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
]

/** AI citation crawlers — allow so engines can cite Nabea (ai-seo skill). */
const AI_CITATION_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Bingbot',
] as const

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerSideURL().replace(/\/$/, '')

  return {
    host: baseUrl,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_DISALLOW,
      },
      ...AI_CITATION_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_DISALLOW,
      })),
      // Training-only crawler — block without affecting citation bots
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
