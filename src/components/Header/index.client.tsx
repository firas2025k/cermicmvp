'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { ExpandableMenu } from './ExpandableMenu'
import { HeaderSearch } from './HeaderSearch'
import type { Header } from 'src/payload-types'
import type { Category } from '@/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'
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

  const banner = header?.promotionalBanner
  const showBanner = banner?.enabled !== false
  const bannerContent = banner?.content?.trim() || 'Kostenloser Versand ab 50€ Bestellwert'
  const bannerBg = banner?.backgroundColor?.trim() || '#991b1b'
  const bannerText = banner?.textColor?.trim() || '#ffffff'

  return (
    <>
      {/* Top promotional bar - editable from Header global */}
      {showBanner && bannerContent ? (
        <div
          className="px-2 py-2.5 text-center text-xs leading-snug sm:py-3 sm:text-sm"
          style={{
            backgroundColor: bannerBg,
            color: bannerText,
          }}
        >
          <p className="mx-auto max-w-4xl">{bannerContent}</p>
        </div>
      ) : null}

      {/* Main Header */}
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="container">
          {/* Top Row: Logo and Icons */}
          <nav className="relative flex items-center justify-between py-3 md:py-4">
            {/* Left: Menu + Account (mobile), Menu only on desktop */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Suspense fallback={null}>
                  <ExpandableMenu menu={menu} categories={categories} />
                </Suspense>
              </div>

              {/* Account icon on the left for mobile, hidden on desktop */}
              <Link
                href="/account"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
                aria-label="Account"
              >
                <svg
                  className="h-5 w-5"
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
            </div>

            {/* Center: Logo - always centered within the header */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link className="flex items-center py-1" href="/">
                <span className="flex items-center gap-3">
                  {logoImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoImage.url}
                      alt={logoImage.alt || logoLabel}
                      className="h-10 w-auto max-h-12 object-contain md:h-16 md:max-h-20"
                    />
                  ) : (
                    <LogoIcon className="h-10 w-10 md:h-16 md:w-16" />
                  )}
                  {logoLabel ? (
                    <span className="hidden text-lg font-semibold text-neutral-900 dark:text-neutral-50 md:inline-block md:text-2xl">
                      {logoLabel}
                    </span>
                  ) : null}
                </span>
              </Link>
            </div>

            {/* Right: Search, Theme Toggle, Account (desktop), Cart */}
            <div className="flex items-center justify-end gap-3 md:gap-4 ml-auto">
              <HeaderSearch />

              {/* Account icon on the right only for desktop */}
              <Link
                href="/account"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 md:flex md:h-10 md:w-10"
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
