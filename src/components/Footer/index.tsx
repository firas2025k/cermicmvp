import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React, { Suspense } from 'react'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Nabea'
const COMPANY_NAME = process.env.COMPANY_NAME || SITE_NAME

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 1)()
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ background: '#2C2A27', color: '#F8F4EE' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

          {/* Brand — spans 2 cols */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-serif text-2xl font-light tracking-widest"
              style={{ color: '#F8F4EE' }}
            >
              {SITE_NAME}
            </Link>
            <p
              className="font-sans text-sm font-light mt-4 max-w-xs leading-relaxed"
              style={{ color: 'rgba(248,244,238,0.5)' }}
            >
              Handcrafted olive wood and ceramic pieces, made with care in Austria.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <p
              className="font-sans text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: 'rgba(248,244,238,0.4)' }}
            >
              Navigate
            </p>
            <Suspense
              fallback={
                <ul className="space-y-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <li key={i} className="h-4 w-28 animate-pulse rounded" style={{ background: 'rgba(248,244,238,0.1)' }} />
                  ))}
                </ul>
              }
            >
              <FooterMenu menu={menu} />
            </Suspense>
          </div>

          {/* Contact */}
          <div>
            <p
              className="font-sans text-xs tracking-[0.2em] uppercase mb-4"
              style={{ color: 'rgba(248,244,238,0.4)' }}
            >
              Contact
            </p>
            <ul className="space-y-2.5">
              <li
                className="font-sans text-sm"
                style={{ color: 'rgba(248,244,238,0.7)' }}
              >
                Wien, Österreich
              </li>
              <li>
                <a
                  href="mailto:hello@nabea.at"
                  className="font-sans text-sm text-[#F8F4EE] opacity-70 hover:opacity-100 transition-opacity"
                >
                  hello@nabea.at
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-sans text-sm text-[#F8F4EE] opacity-70 hover:opacity-100 transition-opacity"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(248,244,238,0.1)' }}
        >
          <p className="font-sans text-xs" style={{ color: 'rgba(248,244,238,0.3)' }}>
            © {currentYear} {COMPANY_NAME}. All rights reserved.
          </p>
          <p className="font-sans text-xs" style={{ color: 'rgba(248,244,238,0.3)' }}>
            Handmade with care · Wien, Austria
          </p>
        </div>

      </div>
    </footer>
  )
}
