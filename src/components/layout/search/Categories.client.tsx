'use client'
import React, { useCallback, useMemo } from 'react'

import { Category } from '@/payload-types'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Props = {
  category: Category
}

export const CategoryItem: React.FC<Props> = ({ category }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = useMemo(() => {
    return searchParams.get('category') === category.slug
  }, [category.slug, searchParams])

  const setQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (isActive) {
      params.delete('category')
    } else {
      params.set('category', category.slug)
    }

    const newParams = params.toString()

    router.push(pathname + '?' + newParams)
  }, [category.slug, isActive, pathname, router, searchParams])

  return (
    <button
      onClick={() => setQuery()}
      className={clsx(
        'w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50',
        {
          'bg-neutral-900 text-white hover:bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900':
            isActive,
          'text-neutral-700 dark:text-neutral-300': !isActive,
        },
      )}
    >
      {category.title}
    </button>
  )
}
