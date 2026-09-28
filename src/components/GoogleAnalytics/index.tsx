'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import {
  COOKIE_CONSENT_EVENT,
  type CookieConsentValue,
  getCookieConsent,
} from '@/utilities/cookieConsent'

type ConsentDetail = { value: CookieConsentValue }

type GtagWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

function trackClientPageView(gaId: string, pagePath: string) {
  const w = window as GtagWindow

  // Prefer gtag — this is what GA4 Realtime “Pages” uses for SPA navigations
  if (typeof w.gtag === 'function') {
    w.gtag('config', gaId, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    })
    return
  }

  // Queue until gtag.js finishes loading
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push([
    'config',
    gaId,
    {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    },
  ])
}

/**
 * Records App Router client navigations in GA4.
 * Skips the first path — initial hit comes from gtag('config') in <GoogleAnalytics />.
 */
function GAPageViews({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPath = useRef<string | null>(null)

  useEffect(() => {
    const query = searchParams?.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    if (previousPath.current === null) {
      previousPath.current = pagePath
      return
    }

    if (previousPath.current === pagePath) return
    previousPath.current = pagePath

    // Let Next update document.title after the soft navigation
    const t = window.setTimeout(() => {
      trackClientPageView(gaId, pagePath)
    }, 0)

    return () => window.clearTimeout(t)
  }, [gaId, pathname, searchParams])

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
        <GAPageViews gaId={measurementId} />
      </Suspense>
    </>
  )
}
