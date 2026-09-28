export type CookieConsentValue = 'accepted' | 'rejected'

export const COOKIE_CONSENT_KEY = 'nabea_cookie_consent'
export const COOKIE_CONSENT_EVENT = 'nabea:cookie-consent'

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY)
    if (value === 'accepted' || value === 'rejected') return value
  } catch {
    // private mode / blocked storage
  }

  return null
}

export function setCookieConsent(value: CookieConsentValue): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value)
  } catch {
    // private mode / blocked storage
  }

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, {
      detail: { value },
    }),
  )
}
