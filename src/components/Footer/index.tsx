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
    <footer className="mt-8 bg-neutral-800 text-neutral-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left: Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Newsletter</h3>
            <p className="text-sm">Bleiben Sie auf dem Laufenden über neue Produkte und Angebote.</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                className="flex-1 rounded-md border border-neutral-600 bg-neutral-700 px-4 py-2 text-sm text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-amber-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                Anmelden
              </button>
            </form>
          </div>

          {/* Center: Logo & Social Media */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <Link className="flex items-center gap-2" href="/">
              <LogoIcon className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">TUNISIAN TILE STUDIO</span>
            </Link>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 transition hover:bg-neutral-600"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 transition hover:bg-neutral-600"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 transition hover:bg-neutral-600"
                aria-label="Pinterest"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12c5.084 0 9.426-3.163 11.174-7.637-.15-.687-.067-1.5.342-2.06.408-.56 1.07-.9 1.77-.9.193 0 .38.03.56.08.006-.2.01-.4.01-.6 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 transition hover:bg-neutral-600"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Navigation</h3>
            <Suspense
              fallback={
                <div className="flex h-[188px] w-[200px] flex-col gap-2">
                  <div className={skeleton} />
                  <div className={skeleton} />
                  <div className={skeleton} />
                </div>
              }
            >
              <FooterMenu menu={menu} />
            </Suspense>
            <div className="space-y-2">
              <Link href="/imprint" className="block text-sm hover:text-white">
                Impressum
              </Link>
              <Link href="/privacy" className="block text-sm hover:text-white">
                Datenschutz
              </Link>
              <Link href="/contact" className="block text-sm hover:text-white">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Payment Methods */}
      <div className="border-t border-neutral-700 bg-neutral-900 py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-neutral-400">
            &copy; {copyrightDate} {copyrightName || 'Tunisian Tile Studio'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-400">Zahlungsmethoden:</span>
            <div className="flex gap-2">
              {/* Payment method logos - these should be actual images */}
              <div className="h-6 w-10 rounded bg-neutral-700" title="Visa" />
              <div className="h-6 w-10 rounded bg-neutral-700" title="Mastercard" />
              <div className="h-6 w-10 rounded bg-neutral-700" title="PayPal" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
