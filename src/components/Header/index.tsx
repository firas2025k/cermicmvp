import { getPayload } from 'payload'
import configPromise from '@payload-config'

import './index.css'
import { HeaderClient } from './index.client'

export async function Header() {
  // Fetch header directly without cache to avoid stale data
  const payload = await getPayload({ config: configPromise })
  
  const header = await payload.findGlobal({
    slug: 'header',
    depth: 2,
  })
  
  // Debug: Log header data (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Header data:', JSON.stringify(header, null, 2))
    console.log('Nav items:', header?.navItems)
    console.log('Nav items length:', header?.navItems?.length || 0)
  }
  
  // Fetch categories for the expandable menu
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })
  
  const categories = categoriesResult.docs || []

  return <HeaderClient header={header} categories={categories} />
}
