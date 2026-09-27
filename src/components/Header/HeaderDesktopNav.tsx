'use client'

import type { Category, Header } from '@/payload-types'
import { organizeCategories, getSubcategories } from '@/lib/categories'
import { categoryNavHref, getNavCategory } from '@/lib/headerNav'
import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

type Props = {
  menu: NonNullable<Header['navItems']>
  categories?: Category[]
}

export function HeaderDesktopNav({ menu, categories = [] }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shopCategory = searchParams.get('category')
  const { byParent } = useMemo(() => organizeCategories(categories), [categories])
  const [openKey, setOpenKey] = useState<string | null>(null)

  // Soft-navigating between /shop?category=… keeps focus in the menu; close the panel.
  useEffect(() => {
    setOpenKey(null)
  }, [pathname, searchParams])

  const linkBase =
    'header-nav-underline inline-flex items-center gap-1 font-sans text-sm tracking-wide text-charcoal transition-colors hover:text-olive'

  return (
    <ul className="flex items-center gap-8 lg:gap-10">
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
          const subActive = subs.some((s) => shopCategory === s.slug)
          const hasSubs = subs.length > 0
          const isOpen = hasSubs && openKey === key

          return (
            <li
              key={key}
              className={cn('relative', isOpen && 'z-50')}
              onMouseEnter={() => {
                if (hasSubs) setOpenKey(key)
              }}
              onMouseLeave={() => setOpenKey(null)}
            >
              <Link
                href={href}
                className={cn(
                  linkBase,
                  (isActive || subActive) && 'header-nav-underline--active text-olive font-medium',
                )}
                onClick={() => setOpenKey(null)}
                aria-expanded={hasSubs ? isOpen : undefined}
                aria-haspopup={hasSubs ? 'menu' : undefined}
              >
                {label}
                {hasSubs ? (
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-warm-gray transition-transform',
                      isOpen && 'rotate-180 text-olive',
                    )}
                    aria-hidden
                  />
                ) : null}
              </Link>
              {hasSubs ? (
                <div
                  className={cn(
                    'absolute left-1/2 top-full z-50 min-w-[11rem] -translate-x-1/2 pt-2 transition-[opacity,visibility] duration-150',
                    isOpen
                      ? 'pointer-events-auto visible opacity-100'
                      : 'pointer-events-none invisible opacity-0',
                  )}
                  role="presentation"
                >
                  <ul
                    className="border border-warm-border bg-white py-2 shadow-md"
                    role="menu"
                    aria-label={label}
                  >
                    {subs.map((sub) => (
                      <li key={sub.id} role="none">
                        <Link
                          role="menuitem"
                          href={categoryNavHref(sub)}
                          onClick={() => setOpenKey(null)}
                          className={cn(
                            'block px-4 py-2 font-sans text-sm text-warm-gray transition-colors hover:bg-linen hover:text-olive',
                            shopCategory === sub.slug && 'bg-linen font-medium text-olive',
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
              ? `${link.reference.relationTo !== 'pages' ? `/${link.reference.relationTo}` : ''}/${link.reference.value.slug}`
              : link.url

        const pathActive =
          !url || url === '#'
            ? false
            : url === '/'
              ? pathname === '/'
              : pathname === url || pathname.startsWith(`${url}/`)

        return (
          <li key={key}>
            <Link
              href={url || '#'}
              target={link.newTab ? '_blank' : undefined}
              rel={link.newTab ? 'noopener noreferrer' : undefined}
              className={cn(linkBase, pathActive && 'header-nav-underline--active text-olive font-medium')}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
