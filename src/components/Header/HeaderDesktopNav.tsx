'use client'

import type { Category, Header } from '@/payload-types'
import { organizeCategories, getSubcategories } from '@/lib/categories'
import { categoryNavHref, getNavCategory } from '@/lib/headerNav'
import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useMemo } from 'react'

type Props = {
  menu: NonNullable<Header['navItems']>
}

export function HeaderDesktopNav({ menu, categories = [] }: Props & { categories?: Category[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shopCategory = searchParams.get('category')
  const { byParent } = useMemo(() => organizeCategories(categories), [categories])

  return (
    <nav className="flex items-center justify-center py-3">
      <ul className="flex items-center gap-8">
        {menu.map((item, index) => {
          if (!item || !item.link) {
            console.warn('Invalid menu item at index', index, item)
            return null
          }

          const link = item.link
          const label = link.label || 'Link'
          const key = item.id || `nav-item-${index}`

          const parentCat = getNavCategory(link)
          if (parentCat) {
            const href = categoryNavHref(parentCat)
            const subs = getSubcategories(parentCat.id, byParent)
            const isActive = pathname.startsWith('/shop') && shopCategory === parentCat.slug
            const hasSubs = subs.length > 0

            return (
              <li key={key} className="group relative focus-within:z-50">
                <Link
                  href={href}
                  className={cn(
                    'inline-flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-amber-800 dark:text-neutral-200 dark:hover:text-white',
                    (isActive || subs.some((s) => shopCategory === s.slug)) &&
                      'font-semibold text-neutral-900 dark:text-white',
                  )}
                >
                  {label}
                  {hasSubs ? (
                    <ChevronDown
                      className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:rotate-180"
                      aria-hidden
                    />
                  ) : null}
                </Link>
                {hasSubs ? (
                  <div
                    className="pointer-events-none invisible absolute left-1/2 top-full z-50 min-w-[11rem] -translate-x-1/2 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 focus-within:pointer-events-auto focus-within:visible focus-within:opacity-100"
                    role="presentation"
                  >
                    <ul
                      className="rounded-lg border border-neutral-200 bg-white py-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                      role="menu"
                      aria-label={label}
                    >
                      <li role="none">
                        <Link
                          role="menuitem"
                          href={href}
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-amber-50 hover:text-amber-900 dark:text-neutral-200 dark:hover:bg-amber-950/40 dark:hover:text-amber-200"
                        >
                          Alle {parentCat.title}
                        </Link>
                      </li>
                      {subs.map((sub) => (
                        <li key={sub.id} role="none">
                          <Link
                            role="menuitem"
                            href={categoryNavHref(sub)}
                            className={cn(
                              'block px-4 py-2 text-sm text-neutral-700 hover:bg-amber-50 hover:text-amber-900 dark:text-neutral-200 dark:hover:bg-amber-950/40 dark:hover:text-amber-200',
                              shopCategory === sub.slug &&
                                'bg-amber-50 font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
                            )}
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            )
          }

          const url =
            link.type === 'custom'
              ? link.url
              : link.reference?.value && typeof link.reference.value === 'object'
                ? `/${link.reference.relationTo}/${link.reference.value.slug}`
                : link.url

          return (
            <li key={key}>
              <Link
                href={url || '#'}
                target={link.newTab ? '_blank' : undefined}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                className={cn(
                  'text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white',
                  {
                    'text-neutral-900 dark:text-white font-semibold':
                      url && url !== '/' && pathname.includes(url),
                  },
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
