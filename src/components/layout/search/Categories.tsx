import configPromise from '@payload-config'
import clsx from 'clsx'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import { organizeCategories } from '@/lib/categories'

import { CategorySidebar } from './CategorySidebar'

async function CategoryList() {
  try {
    const payload = await getPayload({ config: configPromise })

    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'title',
      depth: 1,
    })

    const { topLevel, byParent } = organizeCategories(categoriesResult.docs || [])

    return <CategorySidebar topLevel={topLevel} byParent={byParent} />
  } catch (error) {
    console.error('Error loading categories:', error)
    return (
      <div className="rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Categories</h3>
        <p className="mt-2 text-xs text-neutral-500">Unable to load categories.</p>
      </div>
    )
  }
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
