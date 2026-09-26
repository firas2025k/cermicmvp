import type { Payload, PayloadRequest } from 'payload'

import { calculateShippingCents, orderTotalCents } from '@/utilities/shipping'

export type CouponType = 'percentage' | 'fixed'

export type CouponLike = {
  id: number
  code: string
  type: CouponType
  value: number
  enabled?: boolean | null
  startsAt?: string | null
  endsAt?: string | null
  usageLimit?: number | null
  usageCount?: number | null
  perCustomerLimit?: number | null
  minOrderCents?: number | null
}

export type CouponTotals = {
  merchandiseSubtotalCents: number
  couponDiscountCents: number
  payableMerchandiseCents: number
  shippingCents: number
  chargeTotalCents: number
}

export const normalizeCouponCode = (code: unknown): string => {
  if (typeof code !== 'string') return ''
  return code.trim().toUpperCase()
}

/** Coerce Payload/Postgres numeric fields to integer cents. */
export const toCentsAmount = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    if (Number.isFinite(n)) return Math.round(n)
  }
  return 0
}

export const calculateCouponDiscountCents = (
  merchandiseSubtotalCents: number,
  coupon: Pick<CouponLike, 'type' | 'value'>,
): number => {
  const subtotal = Math.max(0, Math.round(merchandiseSubtotalCents) || 0)
  if (subtotal <= 0) return 0

  if (coupon.type === 'percentage') {
    const pct = Math.min(99, Math.max(1, Math.round(coupon.value)))
    return Math.min(subtotal, Math.round((subtotal * pct) / 100))
  }

  const fixed = Math.max(0, Math.round(coupon.value) || 0)
  return Math.min(subtotal, fixed)
}

/**
 * Live cart UI / sync: prefer recalculating from coupon type+value + current subtotal
 * so Rabatt updates when items change without re-entering the code.
 */
export const resolveCartCouponDiscountCents = (cart: {
  subtotal?: unknown
  couponCode?: string | null
  couponType?: string | null
  couponValue?: unknown
  couponDiscountCents?: unknown
} | null | undefined): number => {
  if (!cart) return 0
  const code = typeof cart.couponCode === 'string' ? cart.couponCode.trim() : ''
  if (!code) return 0

  const subtotal = toCentsAmount(cart.subtotal)
  const type = cart.couponType === 'percentage' || cart.couponType === 'fixed' ? cart.couponType : null
  const value = toCentsAmount(cart.couponValue)

  if (type && value > 0) {
    return calculateCouponDiscountCents(subtotal, { type, value })
  }

  return Math.max(0, toCentsAmount(cart.couponDiscountCents))
}

export const calculateTotalsWithCoupon = (
  merchandiseSubtotalCents: number,
  couponDiscountCents: number,
): CouponTotals => {
  const merchandiseSubtotal = Math.max(0, Math.round(merchandiseSubtotalCents) || 0)
  const discount = Math.min(
    merchandiseSubtotal,
    Math.max(0, Math.round(couponDiscountCents) || 0),
  )
  const payableMerchandiseCents = Math.max(0, merchandiseSubtotal - discount)
  const shippingCents = calculateShippingCents(payableMerchandiseCents)
  const chargeTotalCents = payableMerchandiseCents + shippingCents

  return {
    merchandiseSubtotalCents: merchandiseSubtotal,
    couponDiscountCents: discount,
    payableMerchandiseCents,
    shippingCents,
    chargeTotalCents,
  }
}

/** @deprecated Prefer calculateTotalsWithCoupon when a coupon may apply. */
export { orderTotalCents }

export type ValidateCouponResult =
  | { ok: true; coupon: CouponLike; discountCents: number }
  | { ok: false; error: string }

type ValidateCouponArgs = {
  payload: Payload
  req?: PayloadRequest
  code: string
  merchandiseSubtotalCents: number
  customerEmail?: string | null
}

export async function validateCouponForCart({
  payload,
  req,
  code,
  merchandiseSubtotalCents,
  customerEmail,
}: ValidateCouponArgs): Promise<ValidateCouponResult> {
  const normalized = normalizeCouponCode(code)
  if (!normalized) {
    return { ok: false, error: 'Bitte einen Gutscheincode eingeben.' }
  }

  const found = await payload.find({
    collection: 'coupons',
    where: { code: { equals: normalized } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })

  const coupon = found.docs[0] as CouponLike | undefined
  if (!coupon) {
    return { ok: false, error: 'Dieser Code ist ungültig.' }
  }

  if (!coupon.enabled) {
    return { ok: false, error: 'Dieser Code ist derzeit nicht aktiv.' }
  }

  const now = Date.now()
  if (coupon.startsAt) {
    const start = new Date(coupon.startsAt).getTime()
    if (Number.isFinite(start) && start > now) {
      return { ok: false, error: 'Dieser Code ist noch nicht gültig.' }
    }
  }
  if (coupon.endsAt) {
    const end = new Date(coupon.endsAt).getTime()
    if (Number.isFinite(end) && end < now) {
      return { ok: false, error: 'Dieser Code ist abgelaufen.' }
    }
  }

  const usageCount =
    typeof coupon.usageCount === 'number' && Number.isFinite(coupon.usageCount)
      ? coupon.usageCount
      : 0
  if (
    typeof coupon.usageLimit === 'number' &&
    Number.isFinite(coupon.usageLimit) &&
    usageCount >= coupon.usageLimit
  ) {
    return { ok: false, error: 'Dieser Code wurde bereits vollständig eingelöst.' }
  }

  const subtotal = Math.max(0, Math.round(merchandiseSubtotalCents) || 0)
  if (
    typeof coupon.minOrderCents === 'number' &&
    Number.isFinite(coupon.minOrderCents) &&
    coupon.minOrderCents > 0 &&
    subtotal < coupon.minOrderCents
  ) {
    const minEuros = (coupon.minOrderCents / 100).toLocaleString('de-AT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return {
      ok: false,
      error: `Mindestbestellwert für diesen Code: ${minEuros} €.`,
    }
  }

  const email =
    typeof customerEmail === 'string' ? customerEmail.trim().toLowerCase() : ''
  if (
    email &&
    typeof coupon.perCustomerLimit === 'number' &&
    Number.isFinite(coupon.perCustomerLimit) &&
    coupon.perCustomerLimit > 0
  ) {
    const prior = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { couponCode: { equals: coupon.code } },
          { customerEmail: { equals: email } },
        ],
      },
      limit: coupon.perCustomerLimit,
      depth: 0,
      overrideAccess: true,
      ...(req ? { req } : {}),
    })
    if (prior.totalDocs >= coupon.perCustomerLimit) {
      return {
        ok: false,
        error: 'Du hast diesen Code bereits so oft eingelöst, wie erlaubt.',
      }
    }
  }

  const discountCents = calculateCouponDiscountCents(subtotal, coupon)
  if (discountCents <= 0) {
    return { ok: false, error: 'Dieser Code ergibt für den aktuellen Warenkorb keinen Rabatt.' }
  }

  return { ok: true, coupon, discountCents }
}
