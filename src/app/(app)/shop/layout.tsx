import { Categories } from '@/components/layout/search/Categories'
import { FilterList } from '@/components/layout/search/filter'
import { Search } from '@/components/Search'
import { sorting } from '@/lib/constants'
import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container flex flex-col gap-8 my-16 pb-4 ">
        <Search className="mb-8" />

        <div className="flex flex-col md:flex-row items-start justify-between gap-16 md:gap-4">
          <aside className="w-full flex-none flex flex-col gap-6 basis-1/5 min-w-0 max-w-xs">
            <Categories />
            <FilterList list={sorting} title="Sort by" />
          </aside>
          <div className="min-h-screen w-full flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
