'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { getSubcategories } from '@/lib/categories'
import type { Category } from '@/payload-types'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'

type ByParent = Record<number | string, Category[]>

type Props = {
  topLevel: Category[]
  byParent: ByParent
}

function useSelectedSlugs(): [string[], (slug: string, checked: boolean) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const selected = useMemo(() => {
    const cat = searchParams.getAll('category')
    return Array.isArray(cat) ? cat : cat ? [cat] : []
  }, [searchParams])

  const toggle = useCallback(
    (slug: string, checked: boolean) => {
      const next = new URLSearchParams()
      searchParams.forEach((value, key) => {
        if (key !== 'category') next.set(key, value)
      })
      const current = searchParams.getAll('category')
      if (checked) {
        if (!current.includes(slug)) next.append('category', slug)
      } else {
        current.filter((s) => s !== slug).forEach((s) => next.append('category', s))
      }
      router.push(pathname + (next.toString() ? '?' + next.toString() : ''))
    },
    [pathname, router, searchParams],
  )

  return [selected, toggle]
}

export function CategorySidebar({ topLevel, byParent }: Props) {
  const [selectedSlugs, toggleSlug] = useSelectedSlugs()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isChecked = useCallback(
    (slug: string) => selectedSlugs.includes(slug),
    [selectedSlugs],
  )

  if (!topLevel?.length) return null

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm dark:border-neutral-800/80 dark:bg-neutral-900/60">
      <h3 className="mb-3 text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Categories
      </h3>
      <ul className="space-y-0.5">
        {topLevel.map((category) => {
          if (!category?.id) return null
          const subcategories = getSubcategories(category.id, byParent)
          const hasSubs = subcategories.length > 0
          const idStr = String(category.id)
          const isExpanded = expandedIds.has(idStr)
          const checked = isChecked(category.slug ?? '')

          return (
            <li key={category.id} className="space-y-0.5">
              <div className="flex items-center gap-2 rounded-md py-1.5 pr-2">
                {hasSubs && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(idStr)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-400"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                {!hasSubs && <span className="w-6 shrink-0" />}
                <label className="flex flex-1 cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => toggleSlug(category.slug ?? '', v === true)}
                    className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {category.title}
                  </span>
                </label>
              </div>
              {hasSubs && isExpanded && (
                <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-neutral-200 pl-3 dark:border-neutral-700">
                  {subcategories.map((sub) => {
                    const subChecked = isChecked(sub.slug ?? '')
                    return (
                      <li key={sub.id} className="flex items-center gap-2 py-1">
                        <label className="flex flex-1 cursor-pointer items-center gap-2">
                          <Checkbox
                            checked={subChecked}
                            onCheckedChange={(v) => toggleSlug(sub.slug ?? '', v === true)}
                            className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {sub.title}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
