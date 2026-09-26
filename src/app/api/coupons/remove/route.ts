import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

type Body = {
  cartId?: number | string
  secret?: string
}

export async function POST(request: Request): Promise<Response> {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const cartId = body.cartId
  if (cartId == null || cartId === '') {
    return NextResponse.json({ error: 'Warenkorb fehlt.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const cart = await payload.findByID({
    collection: 'carts',
    id: cartId,
    depth: 0,
    overrideAccess: true,
  })

  if (!cart) {
    return NextResponse.json({ error: 'Warenkorb nicht gefunden.' }, { status: 404 })
  }

  const cartSecret = typeof cart.secret === 'string' ? cart.secret : null
  if (cartSecret && (!body.secret || body.secret !== cartSecret)) {
    return NextResponse.json({ error: 'Warenkorb ungültig.' }, { status: 403 })
  }

  const updated = await payload.update({
    collection: 'carts',
    id: cart.id,
    data: {
      // Must include `items` — ecommerce plugin beforeChange sets subtotal to 0 if items are omitted.
      items: cart.items ?? [],
      appliedCoupon: null,
      couponCode: null,
      couponDiscountCents: 0,
      couponType: null,
      couponValue: null,
      currency: cart.currency || 'EUR',
    },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    cart: {
      id: updated.id,
      subtotal: updated.subtotal,
      couponCode: null,
      couponDiscountCents: 0,
    },
  })
}
