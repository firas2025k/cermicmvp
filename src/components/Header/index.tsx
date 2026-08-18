import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { HeaderClient } from './index.client'
import './index.css'
import {
  filterCategoriesWithPublishedProducts,
  publishedCategoryIdsFromProducts,
} from '@/lib/categories'

export async function Header() {
  // Fetch header directly without cache to avoid stale data
  const payload = await getPayload({ config: configPromise })
  
  const [header, categoriesResult, categorizedProducts] = await Promise.all([
    payload.findGlobal({
      slug: 'header',
      depth: 2,
    }),
    payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'title',
      depth: 1,
    }),
    payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { categories: true },
      where: { _status: { equals: 'published' } },
    }),
  ])

  const publishedCategoryIds = publishedCategoryIdsFromProducts(categorizedProducts.docs)
  const categories = filterCategoriesWithPublishedProducts(
    categoriesResult.docs || [],
    publishedCategoryIds,
  )

  return <HeaderClient header={header} categories={categories} />
}
