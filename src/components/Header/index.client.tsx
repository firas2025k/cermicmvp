'use client'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import { Suspense } from 'react'

import type { Category } from '@/payload-types'
import type { Header } from 'src/payload-types'
import { ExpandableMenu } from './ExpandableMenu'
import { HeaderDesktopNav } from './HeaderDesktopNav'
import { HeaderSearch } from './HeaderSearch'

type Props = {
  header: Header
  categories?: Category[]
}

/**
 * Layout matches design-1/shop.html:
 * one row — logo (left) · inline nav (md+) · locale + search + account + cart (right).
 * Mobile: hamburger + logo (left cluster) · utilities (right).
 */
export function HeaderClient({ header, categories = [] }: Props) {
  const menu = header?.navItems || []

  const rawLogoLabel = (header as { logo?: { label?: string | null } })?.logo?.label
  const logoLabel =
    rawLogoLabel === '' ? '' : rawLogoLabel ?? process.env.NEXT_PUBLIC_SITE_NAME ?? 'Nabea'

  const banner = header?.promotionalBanner
  const showBanner = banner?.enabled !== false
  const bannerContent = banner?.content?.trim() || 'Kostenloser Versand ab 50€ Bestellwert'
  const bannerBg = banner?.backgroundColor?.trim() || '#4A5E3A'
  const bannerText = banner?.textColor?.trim() || '#F8F4EE'

  const iconBtnClass =
    'flex h-9 w-9 items-center justify-center text-charcoal transition-colors hover:text-olive md:h-10 md:w-10'

  const hasDesktopNav = menu && Array.isArray(menu) && menu.length > 0

  return (
    <>
      {showBanner && bannerContent ? (
        <div
          className="px-2 py-2.5 text-center font-sans text-xs leading-snug sm:py-3 sm:text-sm"
          style={{ backgroundColor: bannerBg, color: bannerText }}
        >
          <p className="mx-auto max-w-4xl">{bannerContent}</p>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-warm-border bg-[rgba(248,244,238,0.92)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Left: mobile menu + logo (design: logo left; hamburger only on small screens) */}
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <div className="md:hidden">
              <Suspense fallback={null}>
                <ExpandableMenu menu={menu} categories={categories} />
              </Suspense>
            </div>
            <Link href="/" className="flex min-w-0 items-center py-1">
              {logoLabel ? (
                <span className="truncate font-serif text-2xl font-light tracking-[0.12em] text-charcoal md:text-3xl md:tracking-[0.15em]">
                  {logoLabel}
                </span>
              ) : null}
            </Link>
          </div>

          {/* Center: inline nav (desktop only) — shop.html */}
          {hasDesktopNav ? (
            <nav className="hidden shrink-0 md:flex" aria-label="Main navigation">
              <Suspense fallback={<ul className="flex items-center gap-8" aria-hidden />}>
                <HeaderDesktopNav menu={menu} categories={categories} />
              </Suspense>
            </nav>
          ) : null}

          {/* Right: locale + search + account + cart */}
          <div className="flex shrink-0 items-center gap-4 md:gap-5">
            <button
              type="button"
              className="hidden font-sans text-xs tracking-widest text-warm-gray transition-colors hover:text-olive md:inline"
              aria-label="Language (coming soon)"
            >
              DE&nbsp;|&nbsp;<span className="font-medium text-olive">EN</span>
            </button>
            <HeaderSearch />
            <Link href="/account" className={iconBtnClass} aria-label="Account">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  )
}
