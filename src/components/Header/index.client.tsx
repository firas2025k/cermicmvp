'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { ExpandableMenu } from './ExpandableMenu'
import type { Header } from 'src/payload-types'
import type { Category } from '@/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'
import { ThemeToggle } from '@/components/ThemeToggle'

type Props = {
  header: Header
  categories?: Category[]
}

export function HeaderClient({ header, categories = [] }: Props) {
  const menu = header?.navItems || []
  const pathname = usePathname()

  const logoImage = (header as any)?.logo?.image
  const rawLogoLabel = (header as any)?.logo?.label
  const logoLabel =
    rawLogoLabel === ''
      ? ''
      : rawLogoLabel ?? 'TUNISIAN TILE STUDIO'

  // Debug: Log menu items to console
  if (typeof window !== 'undefined') {
    console.log('Header object:', header)
    console.log('Menu items:', menu)
    console.log('Menu length:', menu.length)
  }

  return (
    <>
      {/* Top promotional bar */}
      <div className="bg-red-900 text-white text-xs py-1.5 text-center">
        <p>Kostenloser Versand ab 50€ Bestellwert</p>
      </div>

      {/* Main Header */}
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container">
          {/* Top Row: Logo and Icons */}
          <nav className="flex items-center justify-between py-4">
            {/* Left: Hamburger Menu (Mobile) */}
            <div className="flex items-center md:hidden">
              <Suspense fallback={null}>
                <ExpandableMenu menu={menu} categories={categories} />
              </Suspense>
            </div>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link className="flex items-center py-1" href="/">
                <span className="flex items-center gap-3">
                  {logoImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoImage.url}
                      alt={logoImage.alt || logoLabel}
                      className="h-12 w-auto max-h-14 object-contain"
                    />
                  ) : (
                    <LogoIcon className="h-12 w-12" />
                  )}
                  {logoLabel ? (
                    <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                      {logoLabel}
                    </span>
                  ) : null}
                </span>
              </Link>
            </div>

            {/* Right: Search, Theme Toggle, User, Cart Icons */}
            <div className="flex items-center justify-end gap-4">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                aria-label="Search"
              >
                <svg
                  className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <ThemeToggle />
              <Link
                href="/account"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                aria-label="Account"
              >
                <svg
                  className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
              <Suspense fallback={<OpenCartButton />}>
                <Cart />
              </Suspense>
            </div>
          </nav>

          {/* Bottom Row: Navigation Links - Centered under logo */}
          {menu && Array.isArray(menu) && menu.length > 0 && (
            <div className="hidden md:block border-t border-neutral-200 dark:border-neutral-800">
              <nav className="flex items-center justify-center py-3">
                <ul className="flex items-center gap-8">
                  {menu.map((item, index) => {
                    if (!item || !item.link) {
                      console.warn('Invalid menu item at index', index, item)
                      return null
                    }
                    
                    // Get the URL - handle both custom URL and reference types
                    const url = item.link.type === 'custom' 
                      ? item.link.url 
                      : item.link.reference?.value && typeof item.link.reference.value === 'object'
                        ? `/${item.link.reference.relationTo}/${item.link.reference.value.slug}`
                        : item.link.url
                    
                    const label = item.link.label || 'Link'
                    
                    return (
                      <li key={item.id || `nav-item-${index}`}>
                        <Link
                          href={url || '#'}
                          target={item.link.newTab ? '_blank' : undefined}
                          rel={item.link.newTab ? 'noopener noreferrer' : undefined}
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
            </div>
          )}
        </div>
      </div>
    </>
  )
}
