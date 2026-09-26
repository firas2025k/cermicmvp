import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import {
  calculateTotalsWithCoupon,
  normalizeCouponCode,
  toCentsAmount,
  validateCouponForCart,
} from '@/utilities/coupons'

type Body = {
  code?: string
  cartId?: number | string
  secret?: string
  email?: string
}

async function loadAuthorizedCart(
  payload: Awaited<ReturnType<typeof getPayload>>,
  cartId: number | string,
  secret?: string,
) {
  const cart = await payload.findByID({
    collection: 'carts',
    id: cartId,
    depth: 0,
    overrideAccess: true,
  })

  if (!cart) return null

  const cartSecret = typeof cart.secret === 'string' ? cart.secret : null
  if (cartSecret) {
    if (!secret || secret !== cartSecret) return null
  }

  return cart
}

export async function POST(request: Request): Promise<Response> {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const cartId = body.cartId
  const code = normalizeCouponCode(body.code)
  if (cartId == null || cartId === '') {
    return NextResponse.json({ error: 'Warenkorb fehlt.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const cart = await loadAuthorizedCart(payload, cartId, body.secret)
  if (!cart) {
    return NextResponse.json({ error: 'Warenkorb nicht gefunden oder ungültig.' }, { status: 403 })
  }

  const subtotal = toCentsAmount(cart.subtotal)

  const result = await validateCouponForCart({
    payload,
    code,
    merchandiseSubtotalCents: subtotal,
    customerEmail: body.email,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const totals = calculateTotalsWithCoupon(subtotal, result.discountCents)
  const couponId =
    typeof result.coupon.id === 'number'
      ? result.coupon.id
      : Number.parseInt(String(result.coupon.id), 10)

  if (!Number.isFinite(couponId)) {
    return NextResponse.json({ error: 'Ungültiger Gutschein.' }, { status: 500 })
  }

  // Must include `items` — ecommerce plugin beforeChange sets subtotal to 0 if items are omitted.
  const updated = await payload.update({
    collection: 'carts',
    id: cart.id,
    data: {
      items: cart.items ?? [],
      appliedCoupon: couponId,
      couponCode: result.coupon.code,
      couponDiscountCents: totals.couponDiscountCents,
      couponType: result.coupon.type,
      couponValue: result.coupon.value,
      currency: cart.currency || 'EUR',
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    couponCode: result.coupon.code,
    couponType: result.coupon.type,
    couponValue: result.coupon.value,
    couponDiscountCents: totals.couponDiscountCents,
    payableMerchandiseCents: totals.payableMerchandiseCents,
    shippingCents: totals.shippingCents,
    chargeTotalCents: totals.chargeTotalCents,
    cart: {
      id: updated.id,
      subtotal: updated.subtotal,
      couponCode: updated.couponCode,
      couponDiscountCents: updated.couponDiscountCents,
    },
  })
}
