import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { LogoIcon } from '@/components/icons/logo'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const skeleton = 'w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700'

  const copyrightName = COMPANY_NAME || SITE_NAME || ''

  return (
    <footer className="mt-8 text-sm text-neutral-600 dark:text-neutral-400">
      <div className="bg-gradient-to-b from-stone-100 via-amber-50 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-stone-900">
        <div className="container">
          <div className="flex w-full flex-col gap-8 border-t border-amber-100/70 py-12 text-sm md:flex-row md:gap-12 dark:border-amber-900/40">
            <div className="max-w-xs space-y-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-neutral-900 shadow-sm ring-1 ring-amber-100/80 md:pt-1 dark:bg-neutral-950/80 dark:text-neutral-50 dark:ring-amber-900/50"
                href="/"
              >
                <LogoIcon className="w-5" />
                <span className="text-xs font-medium tracking-[0.08em] uppercase">
                  Tunisian Tile Studio
                </span>
              </Link>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Imported ceramic tiles from Tunisia, curated for kitchens, baths, and everyday
                spaces that feel warm and lived-in.
              </p>
            </div>
            <Suspense
              fallback={
                <div className="flex h-[188px] w-[200px] flex-col gap-2">
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                </div>
              }
            >
              <FooterMenu menu={menu} />
            </Suspense>
            <div className="md:ml-auto flex flex-col items-end gap-4">
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-amber-900 via-neutral-900 to-stone-900 py-6 text-sm text-neutral-100">
        <div className="container mx-auto flex w-full flex-col items-center gap-1 md:flex-row md:gap-0">
          <p>
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights reserved.
          </p>
          <hr className="mx-4 hidden h-4 w-[1px] border-l border-neutral-500 md:inline-block" />
          <p className="text-neutral-300">Imported tiles, crafted in Tunisia.</p>
          <p className="md:ml-auto">
            <a className="text-neutral-100 underline-offset-4 hover:underline" href="https://payloadcms.com">
              Crafted by Payload
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
