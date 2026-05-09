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

  const activeParentCategory = useMemo(() => {
    if (!activeCategory) return null
    const direct = topLevel.find((p) => p.slug === activeCategory)
    if (direct) return direct
    return (
      topLevel.find((p) => (byParent[p.id] ?? []).some((s) => s.slug === activeCategory)) ?? null
    )
  }, [activeCategory, topLevel, byParent])

  const activeSubs = activeParentCategory ? (byParent[activeParentCategory.id] ?? []) : []

  const handleParentClick = (parent: Category) => {
    setParam('category', activeParentCategory?.slug === parent.slug ? null : parent.slug)
  }

  const handleSubClick = (sub: Category) => {
    setParam('category', activeCategory === sub.slug ? (activeParentCategory?.slug ?? null) : sub.slug)
  }

  return (
    <div className="sticky top-0 z-30 bg-white/98 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] backdrop-blur-md dark:bg-neutral-950/98 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="container">

        {/* Parent category row */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none">

          {/* "Alle" pill */}
          <button
            onClick={() => setParam('category', null)}
            className={cn(
              'shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
              !activeCategory
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
            )}
          >
            Alle
          </button>

          {/* Divider */}
          <div className="mx-1 h-4 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700" />

          {topLevel.map((parent) => {
            const isActive = activeParentCategory?.slug === parent.slug
            const hasSubs = (byParent[parent.id] ?? []).length > 0
            return (
              <button
                key={parent.id}
                onClick={() => handleParentClick(parent)}
                className={cn(
                  'group shrink-0 flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200',
                )}
              >
                {parent.title}
                {hasSubs && (
                  <svg
                    className={cn(
                      'h-3 w-3 transition-transform duration-200',
                      isActive ? 'rotate-180 text-amber-600' : 'text-neutral-400',
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {/* Subcategory row — slides in when a parent is active */}
        {activeSubs.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto border-t border-neutral-100 py-2.5 scrollbar-none dark:border-neutral-800">
            <span className="shrink-0 text-[0.65rem] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pr-1">
              {activeParentCategory?.title}
            </span>
            <div className="h-3 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700" />
            {activeSubs.map((sub) => {
              const isActive = activeCategory === sub.slug
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubClick(sub)}
                  className={cn(
                    'shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-amber-50 hover:text-amber-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-amber-950/40 dark:hover:text-amber-300',
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
