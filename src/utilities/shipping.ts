import { formatEUR } from '@/utilities/formatEUR'

/** Free shipping at or above this cart subtotal (cents). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000

/** Flat Versandkosten when under the free-shipping threshold (cents, brutto). */
export const FLAT_SHIPPING_CENTS = 690

/** Default CMS display threshold in euros (progress bar). */
export const DEFAULT_FREE_SHIPPING_THRESHOLD_EUROS = 50

/**
 * Server-authoritative shipping for checkout / Stripe.
 * ≥ €50 subtotal → free; otherwise €6.90.
 */
export function calculateShippingCents(subtotalCents: number): number {
  const subtotal = Math.max(0, Math.round(subtotalCents) || 0)
  return subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS
}

export function formatShippingLabel(shippingCents: number): string {
  if (shippingCents === 0) return 'Kostenlos'
  return formatEUR(shippingCents)
}

export function orderTotalCents(subtotalCents: number): number {
  const subtotal = Math.max(0, Math.round(subtotalCents) || 0)
  return subtotal + calculateShippingCents(subtotal)
}
