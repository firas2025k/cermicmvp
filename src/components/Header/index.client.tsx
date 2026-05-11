'use client'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { ExpandableMenu } from './ExpandableMenu'
import { HeaderDesktopNav } from './HeaderDesktopNav'
import { HeaderSearch } from './HeaderSearch'
import type { Header } from 'src/payload-types'
import type { Category } from '@/payload-types'

import { LogoIcon } from '@/components/icons/logo'

type Props = {
  header: Header
  categories?: Category[]
}

export function HeaderClient({ header, categories = [] }: Props) {
  const menu = header?.navItems || []

  const logoImage = (header as { logo?: { image?: { url?: string; alt?: string } } })?.logo?.image
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
        <div className="container">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Suspense fallback={null}>
                  <ExpandableMenu menu={menu} categories={categories} />
                </Suspense>
              </div>

              <Link href="/account" className={`${iconBtnClass} md:hidden`} aria-label="Account">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link className="flex items-center py-1" href="/">
                <span className="flex items-center gap-3">
                  {logoImage?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoImage.url}
                      alt={logoImage.alt || logoLabel}
                      className="h-9 w-auto max-h-11 object-contain md:h-11 md:max-h-14"
                    />
                  ) : (
                    <LogoIcon className="h-9 w-9 fill-olive md:h-11 md:w-11" />
                  )}
                  {logoLabel ? (
                    <span className="hidden font-serif text-2xl font-light tracking-[0.12em] text-charcoal md:inline-block">
                      {logoLabel}
                    </span>
                  ) : null}
                </span>
              </Link>
            </div>

            <div className="ml-auto flex items-center justify-end gap-1 md:gap-2">
              <HeaderSearch />

              <Link href="/account" className={`${iconBtnClass} hidden md:flex`} aria-label="Account">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
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

          {menu && Array.isArray(menu) && menu.length > 0 && (
            <div className="hidden border-t border-warm-border md:block">
              <Suspense fallback={<nav className="flex justify-center py-3" aria-hidden />}>
                <HeaderDesktopNav menu={menu} categories={categories} />
              </Suspense>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
