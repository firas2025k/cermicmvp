import configPromise from '@payload-config'
import clsx from 'clsx'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import { CategoryItem } from './Categories.client'

async function CategoryList() {
  const payload = await getPayload({ config: configPromise })

  const categoriesResult = await payload.find({
    collection: 'categories',
    sort: 'title',
    depth: 1, // Fetch parent relationships
  })

  const { organizeCategories, getSubcategories } = await import('@/lib/categories')
  const { topLevel, byParent } = organizeCategories(categoriesResult.docs || [])

  return (
    <div>
      <h3 className="text-xs mb-2 text-neutral-500 dark:text-neutral-400">Category</h3>

      <ul>
        {topLevel.map((category) => {
          const subcategories = getSubcategories(category.id, byParent)
          return (
            <li key={category.id} className="mb-2">
              <CategoryItem category={category} />
              {subcategories.length > 0 && (
                <ul className="ml-4 mt-1 space-y-1">
                  {subcategories.map((subcategory) => (
                    <li key={subcategory.id}>
                      <CategoryItem category={subcategory} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded'
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300'
const items = 'bg-neutral-400 dark:bg-neutral-700'

export function Categories() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <CategoryList />
    </Suspense>
  )
}
