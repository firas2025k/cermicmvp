'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
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

function ensureGtag() {
  const w = window as GtagWindow
  w.dataLayer = w.dataLayer || []

  if (typeof w.gtag !== 'function') {
    // Mirror Google's snippet: dataLayer must receive an Arguments object
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments)
    }
  }

  return w.gtag!
}

function sendPageView(gaId: string, pagePath: string) {
  const gtag = ensureGtag()
  gtag('event', 'page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
    send_to: gaId,
  })
}

function buildPagePath(pathname: string, searchParams: URLSearchParams | null) {
  const query = searchParams?.toString()
  return query ? `${pathname}?${query}` : pathname
}

/**
 * Own the GA4 SPA lifecycle: load gtag once, disable the automatic first hit,
 * then send page_view for the current route and every App Router navigation.
 */
function GATracker({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pagePath = buildPagePath(pathname, searchParams)
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    const gtag = ensureGtag()
    gtag('js', new Date())
    gtag('config', gaId, {
      send_page_view: false,
      anonymize_ip: true,
    })
  }, [gaId])

  useEffect(() => {
    if (scriptReady) return
    const existing = document.querySelector(
      `script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`,
    )
    if (existing) setScriptReady(true)
  }, [gaId, scriptReady])

  useEffect(() => {
    if (!scriptReady) return

    // Wait a tick so Next can update document.title after soft navigation
    const t = window.setTimeout(() => {
      sendPageView(gaId, pagePath)
    }, 0)

    return () => window.clearTimeout(t)
  }, [gaId, pagePath, scriptReady])

  return (
    <>
      <Script id="nabea-ga-datalayer" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};`}
      </Script>
      <Script
        id="nabea-ga-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />
    </>
  )
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
    <Suspense fallback={null}>
      <GATracker gaId={measurementId} />
    </Suspense>
  )
}
