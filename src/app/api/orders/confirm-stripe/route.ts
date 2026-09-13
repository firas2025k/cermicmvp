import configPromise from '@payload-config'
import { confirmStripeOrder } from '@/utilities/confirmStripeOrder'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

type Body = {
  paymentIntentID?: string
  customerEmail?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ message: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const paymentIntentID =
    typeof body.paymentIntentID === 'string' ? body.paymentIntentID.trim() : ''
  const customerEmail =
    typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : ''

  if (!paymentIntentID) {
    return NextResponse.json({ message: 'paymentIntentID ist erforderlich.' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })

    const result = await confirmStripeOrder({
      payload,
      paymentIntentID,
      customerEmail: customerEmail || null,
      userId: user?.id ?? null,
    })

    return NextResponse.json({
      orderID: result.orderID,
      alreadyConfirmed: result.alreadyConfirmed,
      message: result.alreadyConfirmed
        ? 'Bestellung war bereits bestätigt.'
        : 'Bestellung erfolgreich bestätigt.',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bestätigung fehlgeschlagen.'
    console.error('[api/orders/confirm-stripe]', err)
    return NextResponse.json({ message }, { status: 500 })
  }
}
