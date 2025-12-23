import configPromise from '@payload-config'
import clsx from 'clsx'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import { organizeCategories } from '@/lib/categories'
import { Item } from './Item'

async function List() {
  try {
    const payload = await getPayload({ config: configPromise })
    const categoriesData = await payload.find({
      collection: 'categories',
      sort: 'title',
      depth: 1, // Fetch parent relationships
      select: {
        title: true,
        slug: true,
        parent: true,
      },
    })

    const { topLevel } = organizeCategories(categoriesData.docs || [])

    // For tabs, we'll show only top-level categories
    const categories = topLevel
      .filter((cat) => cat && cat.slug && cat.title)
      .map((category) => {
        return {
          href: `/shop/${category.slug}`,
          title: category.title,
        }
      })

    return (
      <React.Fragment>
        <nav>
          <ul className="flex gap-3">
            <Item title="All" href="/shop" />
            <Suspense fallback={null}>
              {categories.map((category) => {
                return <Item {...category} key={category.href} />
              })}
            </Suspense>
          </ul>
        </nav>
      </React.Fragment>
    )
  } catch (error) {
    console.error('Error loading category tabs:', error)
    return (
      <nav>
        <ul className="flex gap-3">
          <Item title="All" href="/shop" />
        </ul>
      </nav>
    )
  }
}

const skeleton = 'mb-3 h-4 w-5/6 animate-pulse rounded'
const activeAndTitles = 'bg-neutral-800 dark:bg-neutral-300'
const items = 'bg-neutral-400 dark:bg-neutral-700'

export function CategoryTabs() {
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
      <List />
    </Suspense>
  )
}
