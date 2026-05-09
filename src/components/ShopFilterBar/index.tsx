'use client'

import type { Category } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'

type Props = {
  topLevel: Category[]
  byParent: Record<string | number, Category[]>
  activeCategory: string | null
  activeSort?: string | null
}

export function ShopFilterBar({ topLevel, byParent, activeCategory }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(pathname + (params.toString() ? '?' + params.toString() : ''))
    },
    [pathname, router, searchParams],
  )

  // Determine which top-level category is "active" (directly or via a selected sub)
  const activeParentCategory = useMemo(() => {
    if (!activeCategory) return null
    // Direct parent match
    const direct = topLevel.find((p) => p.slug === activeCategory)
    if (direct) return direct
    // Match via subcategory
    return (
      topLevel.find((p) => (byParent[p.id] ?? []).some((s) => s.slug === activeCategory)) ?? null
    )
  }, [activeCategory, topLevel, byParent])

  // Subcategories to show under the pill row
  const activeSubs = activeParentCategory ? (byParent[activeParentCategory.id] ?? []) : []

  const handleParentClick = (parent: Category) => {
    if (activeParentCategory?.slug === parent.slug) {
      // Clicking the already-active parent deselects
      setParam('category', null)
    } else {
      setParam('category', parent.slug)
    }
  }

  const handleSubClick = (sub: Category) => {
    if (activeCategory === sub.slug) {
      // Clicking the active sub goes back up to its parent
      setParam('category', activeParentCategory?.slug ?? null)
    } else {
      setParam('category', sub.slug)
    }
  }

  return (
    <div className="sticky top-0 z-30 border-b border-neutral-100 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="container">
        {/* Main filter row */}
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Category pills */}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-px scrollbar-none">
            <button
              onClick={() => setParam('category', null)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                !activeCategory
                  ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-amber-300 hover:text-amber-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
              )}
            >
              Alle
            </button>

            {topLevel.map((parent) => {
              const isActive = activeParentCategory?.slug === parent.slug
              return (
                <button
                  key={parent.id}
                  onClick={() => handleParentClick(parent)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                    isActive
                      ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-amber-300 hover:text-amber-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
                  )}
                >
                  {parent.title}
                </button>
              )
            })}
          </div>

        </div>

        {/* Subcategory pills — visible when a parent is selected and it has children */}
        {activeSubs.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            {activeSubs.map((sub) => {
              const isActive = activeCategory === sub.slug
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubClick(sub)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    isActive
                      ? 'border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-amber-300 hover:text-amber-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
                  )}
                >
                  {sub.title}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
