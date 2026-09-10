import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { sendStockRequestEmails } from '@/utilities/stockNotificationEmails'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, productId, productTitle, variantId, variantTitle } = body

    if (!email || !productId) {
      return NextResponse.json({ message: 'Email and productId are required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ message: 'Invalid email address.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const product = await payload.findByID({
      collection: 'products',
      id: Number(productId),
      depth: 0,
      overrideAccess: true,
      select: {
        title: true,
        slug: true,
      },
    }).catch(() => null)

    const resolvedTitle =
      (product && typeof product.title === 'string' && product.title) ||
      (productTitle ? String(productTitle) : 'Produkt')
    const resolvedSlug = product && typeof product.slug === 'string' ? product.slug : null

    await payload.create({
      collection: 'stock-notifications',
      data: {
        name: name ? String(name) : undefined,
        email: String(email).trim().toLowerCase(),
        product: Number(productId),
        productTitle: resolvedTitle,
        variantId: variantId ? Number(variantId) : undefined,
        variantTitle: variantTitle ? String(variantTitle) : undefined,
        notified: false,
      },
    })

    // Persist first; email failures must not fail the guest request.
    await sendStockRequestEmails(payload, {
      customerName: name ? String(name) : null,
      customerEmail: String(email).trim().toLowerCase(),
      productTitle: resolvedTitle,
      productSlug: resolvedSlug,
      variantId: variantId ? Number(variantId) : null,
      variantTitle: variantTitle ? String(variantTitle) : null,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[stock-notifications] POST error:', err)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
