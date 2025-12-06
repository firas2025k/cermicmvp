'use client'
import { CMSLink } from '@/components/Link'
import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { MobileMenu } from './MobileMenu'
import type { Header } from 'src/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/cn'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-30 border-b border-amber-100/80 bg-gradient-to-b from-amber-50/80 via-neutral-50/90 to-stone-50/90 backdrop-blur-md dark:border-amber-900/40 dark:bg-gradient-to-b dark:from-neutral-950/90 dark:via-neutral-950/80 dark:to-neutral-900/90">
      <nav className="container flex items-center justify-between py-3 md:py-4">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:w-1/3">
            <div className="block flex-none md:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={menu} />
              </Suspense>
            </div>
            <Link className="flex items-center py-1" href="/">
              <span className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm ring-1 ring-amber-100/80 dark:bg-neutral-950/80 dark:text-neutral-50 dark:ring-amber-900/50">
                <LogoIcon className="h-5 w-5" />
                <span className="hidden text-[0.7rem] tracking-[0.12em] sm:inline">
                  TUNISIAN TILE STUDIO
                </span>
              </span>
            </Link>
          </div>

          {menu.length ? (
            <div className="hidden justify-center md:flex md:w-1/3">
              <ul className="flex gap-6 text-xs md:items-center">
                {menu.map((item) => (
                  <li key={item.id}>
                    <CMSLink
                      {...item.link}
                      size={'clear'}
                      className={cn(
                        'relative navLink px-1 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white',
                        {
                          active:
                            item.link.url && item.link.url !== '/'
                              ? pathname.includes(item.link.url)
                              : false,
                        },
                      )}
                      appearance="nav"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex justify-end gap-3 md:w-1/3">
            <Suspense fallback={<OpenCartButton />}>
              <Cart />
            </Suspense>
          </div>
        </div>
      </nav>
    </div>
  )
}
