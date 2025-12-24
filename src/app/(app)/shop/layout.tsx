import { Categories } from '@/components/layout/search/Categories'
import { FilterList } from '@/components/layout/search/filter'
import { Search } from '@/components/Search'
import { ShopFilters } from '@/components/ShopFilters'
import { sorting } from '@/lib/constants'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

async function ShopFiltersWrapper() {
  const payload = await getPayload({ config: configPromise })
  
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
    depth: 1, // Fetch parent relationships
  })
  
  const categories = categoriesResult.docs || []
  
  return <ShopFilters categories={categories} />
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container flex flex-col gap-8 my-16 pb-4 ">
        <Search className="mb-8" />

        <div className="flex flex-col md:flex-row items-start justify-between gap-16 md:gap-4">
          <div className="w-full flex-none flex flex-col gap-4 md:gap-8 basis-1/5">
            <Categories />
            <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />}>
              <ShopFiltersWrapper />
            </Suspense>
            <FilterList list={sorting} title="Sort by" />
          </div>
          <div className="min-h-screen w-full">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
