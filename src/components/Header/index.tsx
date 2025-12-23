import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { HeaderClient } from './index.client'
import './index.css'

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
  
  // Fetch categories for the expandable menu with parent relationships
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
    depth: 1, // Fetch parent relationships
  })
  
  const categories = categoriesResult.docs || []

  return <HeaderClient header={header} categories={categories} />
}
