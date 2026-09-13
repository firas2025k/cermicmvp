import type { Payload, PayloadRequest } from 'payload'
import Stripe from 'stripe'

type ConfirmStripeOrderArgs = {
  payload: Payload
  req?: PayloadRequest
  paymentIntentID: string
  customerEmail?: string | null
  userId?: number | string | null
}

type ConfirmStripeOrderResult = {
  orderID: number | string
  alreadyConfirmed: boolean
}

const getStripe = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured.')
  }

  return new Stripe(secretKey, {
    // Match plugin default; Stripe SDKs pin the latest typed version.
    // @ts-expect-error Stripe API version string varies by SDK release
    apiVersion: '2025-03-31.basil',
    appInfo: {
      name: 'Nabea Order Confirm',
      url: 'https://nabea.at',
    },
  })
}

/**
 * Confirm a paid Stripe PaymentIntent into a Payload order.
 * Does not depend on browser cart state — uses PI metadata + transaction record.
 * Idempotent: returns existing order if the transaction is already linked.
 */
export async function confirmStripeOrder({
  payload,
  req,
  paymentIntentID,
  customerEmail: customerEmailFromClient,
  userId,
}: ConfirmStripeOrderArgs): Promise<ConfirmStripeOrderResult> {
  if (!paymentIntentID?.trim()) {
    throw new Error('PaymentIntent ID is required.')
  }

  const stripe = getStripe()
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID)

  if (paymentIntent.status !== 'succeeded') {
    throw new Error(
      `Zahlung ist noch nicht abgeschlossen (Status: ${paymentIntent.status}).`,
    )
  }

  const transactions = await payload.find({
    collection: 'transactions',
    where: {
      'stripe.paymentIntentID': {
        equals: paymentIntentID,
      },
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })

  const transaction = transactions.docs[0]
  if (!transaction) {
    throw new Error('Keine Transaktion für diese Zahlung gefunden.')
  }

  // Idempotent: payment already fulfilled
  if (transaction.order) {
    const existingOrderID =
      typeof transaction.order === 'object' ? transaction.order.id : transaction.order
    return { orderID: existingOrderID, alreadyConfirmed: true }
  }

  const cartID = paymentIntent.metadata?.cartID
  const cartItemsSnapshot = paymentIntent.metadata?.cartItemsSnapshot
    ? JSON.parse(paymentIntent.metadata.cartItemsSnapshot)
    : undefined
  const shippingAddress = paymentIntent.metadata?.shippingAddress
    ? JSON.parse(paymentIntent.metadata.shippingAddress)
    : undefined

  if (!cartID) {
    throw new Error('Warenkorb-ID fehlt in der Zahlungs-Metadaten.')
  }
  if (!cartItemsSnapshot || !Array.isArray(cartItemsSnapshot)) {
    throw new Error('Warenkorb-Daten fehlen in der Zahlungs-Metadaten.')
  }

  const customerEmail =
    (typeof customerEmailFromClient === 'string' && customerEmailFromClient.trim()) ||
    (typeof transaction.customerEmail === 'string' && transaction.customerEmail.trim()) ||
    paymentIntent.receipt_email ||
    ''

  const orderData: Record<string, unknown> = {
    amount: paymentIntent.amount,
    currency: paymentIntent.currency.toUpperCase(),
    items: cartItemsSnapshot,
    shippingAddress,
    status: 'processing',
    transactions: [transaction.id],
  }

  if (userId != null) {
    orderData.customer = userId
  } else if (customerEmail) {
    orderData.customerEmail = customerEmail.toLowerCase()
  } else {
    throw new Error('Eine E-Mail-Adresse ist für die Bestellung erforderlich.')
  }

  const order = await payload.create({
    collection: 'orders',
    // Plugin order shape; cast keeps us aligned with ecommerce fields.
    data: orderData as never,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })

  const timestamp = new Date().toISOString()

  try {
    await payload.update({
      id: cartID,
      collection: 'carts',
      data: { purchasedAt: timestamp },
      overrideAccess: true,
      ...(req ? { req } : {}),
    })
  } catch (err) {
    payload.logger.warn(
      { err, cartID, orderID: order.id },
      '[confirm-stripe] Cart mark-purchased failed (order still created)',
    )
  }

  await payload.update({
    id: transaction.id,
    collection: 'transactions',
    data: {
      order: order.id,
      status: 'succeeded',
    },
    overrideAccess: true,
    ...(req ? { req } : {}),
  })

  // Decrement inventory from transaction line items (same as plugin confirm handler)
  if (Array.isArray(transaction.items) && transaction.items.length > 0) {
    for (const item of transaction.items) {
      try {
        if (item.variant) {
          const id = typeof item.variant === 'object' ? item.variant.id : item.variant
          await payload.db.updateOne({
            id,
            collection: 'variants',
            data: {
              inventory: {
                $inc: item.quantity * -1,
              },
            },
          })
        } else if (item.product) {
          const id = typeof item.product === 'object' ? item.product.id : item.product
          await payload.db.updateOne({
            id,
            collection: 'products',
            data: {
              inventory: {
                $inc: item.quantity * -1,
              },
            },
          })
        }
      } catch (err) {
        payload.logger.error(
          { err, orderID: order.id },
          '[confirm-stripe] Inventory decrement failed for line item',
        )
      }
    }
  }

  return { orderID: order.id, alreadyConfirmed: false }
}
