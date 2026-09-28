'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'
import {
  COOKIE_CONSENT_EVENT,
  type CookieConsentValue,
  getCookieConsent,
} from '@/utilities/cookieConsent'

type ConsentDetail = { value: CookieConsentValue }

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

  return <GoogleAnalytics gaId={measurementId} />
}
