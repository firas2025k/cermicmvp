import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, productId, productTitle, variantId, variantTitle } = body

    if (!email || !productId) {
      return NextResponse.json({ message: 'Email and productId are required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ message: 'Invalid email address.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    await payload.create({
      collection: 'stock-notifications',
      data: {
        email: String(email),
        product: Number(productId),
        productTitle: productTitle ? String(productTitle) : undefined,
        variantId: variantId ? Number(variantId) : undefined,
        variantTitle: variantTitle ? String(variantTitle) : undefined,
        notified: false,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[stock-notifications] POST error:', err)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
