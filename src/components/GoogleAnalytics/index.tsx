'use client'

import { GoogleAnalytics, sendGAEvent } from '@next/third-parties/google'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import {
  COOKIE_CONSENT_EVENT,
  type CookieConsentValue,
  getCookieConsent,
} from '@/utilities/cookieConsent'

type ConsentDetail = { value: CookieConsentValue }

/**
 * Sends page_view on App Router client navigations.
 * Skips the first run — gtag('config') already records the initial load.
 */
function GAPageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstPath = useRef(true)

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false
      return
    }

    const query = searchParams?.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    sendGAEvent('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return null
}

export function GoogleAnalyticsGate() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)

  useEffect(() => {
    setConsent(getCookieConsent())

    const onConsent = (event: Event) => {
      const custom = event as CustomEvent<ConsentDetail>
      const value = custom.detail?.value
      if (value === 'accepted' || value === 'rejected') {
        setConsent(value)
      }
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent)
  }, [])

  if (!measurementId || consent !== 'accepted') {
    return null
  }

  return (
    <>
      <GoogleAnalytics gaId={measurementId} />
      <Suspense fallback={null}>
        <GAPageViews />
      </Suspense>
    </>
  )
}
