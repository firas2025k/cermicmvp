import type { MetadataRoute } from 'next'

import configPromise from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { getPayload } from 'payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerSideURL().replace(/\/$/, '')
  const payload = await getPayload({ config: configPromise })
  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      changeFrequency: 'weekly',
      lastModified: now,
      priority: 1,
      url: `${baseUrl}/`,
    },
    {
      changeFrequency: 'daily',
      lastModified: now,
      priority: 0.9,
      url: `${baseUrl}/shop`,
    },
  ]

  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      updatedAt: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  for (const page of pages.docs) {
    if (!page.slug || page.slug === 'home') continue

    entries.push({
      changeFrequency: 'weekly',
      lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
      priority: 0.7,
      url: `${baseUrl}/${page.slug}`,
    })
  }

  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      updatedAt: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  for (const product of products.docs) {
    if (!product.slug) continue

    entries.push({
      changeFrequency: 'weekly',
      lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
      priority: 0.8,
      url: `${baseUrl}/products/${product.slug}`,
    })
  }

  return entries
}
