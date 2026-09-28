'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  type CookieConsentValue,
  getCookieConsent,
  setCookieConsent,
} from '@/utilities/cookieConsent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getCookieConsent() === null)
  }, [])

  const choose = (value: CookieConsentValue) => {
    setCookieConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-warm-border bg-linen p-5 shadow-[0_-8px_24px_rgba(44,42,39,0.08)] sm:p-6"
    >
      <div className="container flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1">
          <h2
            id="cookie-consent-title"
            className="mb-2 font-serif text-xl font-light text-charcoal"
          >
            Cookies & Analyse
          </h2>
          <p id="cookie-consent-desc" className="font-sans text-sm leading-relaxed text-warm-gray">
            Wir verwenden optionale Cookies für Google Analytics, um unseren Shop zu verbessern.
            Essenzielle Cookies für den Betrieb der Website sind davon nicht betroffen. Mehr in
            unserer{' '}
            <Link href="/cookies" className="text-olive underline-offset-2 hover:underline">
              Cookie-Richtlinie
            </Link>{' '}
            und{' '}
            <Link href="/datenschutz" className="text-olive underline-offset-2 hover:underline">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => choose('rejected')}
            className="inline-flex items-center justify-center border border-warm-border bg-white px-5 py-3 font-sans text-[0.75rem] tracking-[0.14em] text-charcoal uppercase transition-colors hover:border-olive hover:text-olive"
          >
            Ablehnen
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="inline-flex items-center justify-center bg-[#6B1F3A] px-5 py-3 font-sans text-[0.75rem] tracking-[0.14em] text-[#F8F4EE] uppercase transition-colors hover:bg-[#4E1628]"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  )
}
