'use client'

import type { Category } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'title', label: 'Sort: Featured' },
  { value: 'priceInEUR', label: 'Price: Low to High' },
  { value: '-priceInEUR', label: 'Price: High to Low' },
  { value: '-createdAt', label: 'Newest' },
]

type Props = {
  topLevel: Category[]
  byParent: Record<string | number, Category[]>
  activeCategory: string | null
  activeSort?: string | null
  productCount: number
}

export function ShopFilterBar({
  topLevel,
  byParent,
  activeCategory,
  activeSort,
  productCount,
}: Props) {
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

  // Which top-level category is active (either directly selected or parent of selected sub)
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
    setParam(
      'category',
      activeCategory === sub.slug ? (activeParentCategory?.slug ?? null) : sub.slug,
    )
  }

  const filterBtnClass = (isActive: boolean) =>
    cn(
      'cursor-pointer border px-5 py-2 text-[11px] tracking-[0.15em] uppercase transition-all duration-200 font-sans',
      isActive
        ? 'border-olive bg-olive text-linen'
        : 'border-warm-border text-warm-gray hover:border-olive hover:bg-olive hover:text-linen',
    )

  return (
    <section className="sticky top-16 z-20 border-y border-warm-border bg-white">
      {/* Row 1: categories + sort */}
      <div className="container py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category filter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
            <button onClick={() => setParam('category', null)} className={cn(filterBtnClass(!activeCategory), 'flex-shrink-0')}>
              All
            </button>
            {topLevel.map((parent) => (
              <button
                key={parent.id}
                onClick={() => handleParentClick(parent)}
                className={cn(filterBtnClass(activeParentCategory?.slug === parent.slug), 'flex-shrink-0')}
              >
                {parent.title}
              </button>
            ))}
          </div>

          {/* Right side: product count + sort */}
          <div className="flex items-center gap-6">
            <span className="font-sans text-xs text-warm-gray">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>

            <div className="relative">
              <select
                value={activeSort ?? 'title'}
                onChange={(e) => setParam('sort', e.target.value)}
                className="cursor-pointer appearance-none border border-warm-border bg-transparent py-2 pr-8 pl-3 font-sans text-xs text-charcoal outline-none"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-warm-gray"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Row 2: subcategory pills — slides in when a parent is active */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            activeSubs.length > 0 ? 'mt-3 max-h-40 border-t border-warm-border pt-3' : 'max-h-0',
          )}
        >
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
            {activeSubs.map((sub, index) => {
              const isActive = activeCategory === sub.slug
              return (
                <React.Fragment key={sub.id}>
                  {index > 0 ? (
                    <span className="select-none text-[11px] text-warm-border">·</span>
                  ) : null}
                  <button
                    onClick={() => handleSubClick(sub)}
                    className={cn(
                      'flex-shrink-0 cursor-pointer border px-3 py-1 font-sans text-[11px] tracking-[0.1em] uppercase transition-all duration-150',
                      isActive
                        ? 'border-olive font-medium text-olive'
                        : 'border-transparent text-warm-gray hover:border-olive hover:text-olive',
                    )}
                  >
                    {sub.title}
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
