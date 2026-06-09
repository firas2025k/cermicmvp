import type { Footer } from '@/payload-types'

import { FooterMenu } from '@/components/Footer/menu'
import { FooterNewsletterForm } from '@/components/Footer/NewsletterForm'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import { Suspense } from 'react'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Nabea'
const COMPANY_NAME = process.env.COMPANY_NAME || SITE_NAME

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
}

export async function Footer() {
  const footer = (await getCachedGlobal('footer', 1)()) as Footer
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()

  const tagline =
    footer.brand?.tagline || 'Handcrafted olive wood and ceramic pieces, made with care in Austria.'
  const address = footer.contactInfo?.address || 'Wien, Österreich'
  const email = footer.contactInfo?.email || 'hello@nabea.at'
  const phone = footer.contactInfo?.phone
  const socialLinks = footer.socialLinks || []
  const legalLinks = footer.legalLinks || []
  const newsletter = footer.newsletter

  return (
    <footer style={{ background: '#2C2A27', color: '#F8F4EE' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">

        {/* ── Newsletter banner (optional) ──────────────────────────────── */}
        {newsletter?.enabled && (
          <FooterNewsletterForm
            title={newsletter.title}
            description={newsletter.description}
          />
        )}

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
              {tagline}
            </p>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-6">
                {socialLinks.map((s) => (
                  <a
                    key={s.id ?? s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-xs tracking-wide opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: '#F8F4EE' }}
                  >
                    {SOCIAL_LABELS[s.platform] ?? s.platform}
                  </a>
                ))}
              </div>
            )}
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
              Kontakt
            </p>
            <ul className="space-y-2.5">
              {address && (
                <li className="font-sans text-sm" style={{ color: 'rgba(248,244,238,0.7)' }}>
                  {address}
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="font-sans text-sm text-[#F8F4EE] opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="font-sans text-sm text-[#F8F4EE] opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {phone}
                  </a>
                </li>
              )}
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

          {/* Legal links */}
          {legalLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-1 justify-center sm:justify-end">
              {legalLinks.map((l) => (
                <li key={l.id ?? l.label}>
                  <Link
                    href={l.url}
                    className="font-sans text-xs opacity-40 hover:opacity-70 transition-opacity"
                    style={{ color: '#F8F4EE' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-xs" style={{ color: 'rgba(248,244,238,0.3)' }}>
              Handmade with care · Wien, Austria
            </p>
          )}
        </div>

      </div>
    </footer>
  )
}
