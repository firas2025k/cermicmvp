import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import Stripe from 'stripe'

import { calculateShippingCents } from '@/utilities/shipping'

/**
 * Wraps the ecommerce Stripe adapter so PaymentIntent amount includes flat shipping
 * when cart subtotal is under the free-shipping threshold. DB cart subtotal is unchanged;
 * only the value passed into initiatePayment is inflated.
 */
export function withShippingOnStripeAdapter(
  adapter: PaymentAdapter,
  secretKey: string,
): PaymentAdapter {
  const baseInitiate = adapter.initiatePayment

  return {
    ...adapter,
    initiatePayment: async (args) => {
      const cart = args.data.cart
      const productSubtotal =
        typeof cart.subtotal === 'number' && Number.isFinite(cart.subtotal) ? cart.subtotal : 0
      const shippingCents = calculateShippingCents(productSubtotal)

      const result = await baseInitiate({
        ...args,
        data: {
          ...args.data,
          cart: {
            ...cart,
            subtotal: productSubtotal + shippingCents,
          },
        },
      })

      const paymentIntentID =
        typeof result.paymentIntentID === 'string' ? result.paymentIntentID : null

      if (paymentIntentID && secretKey) {
        try {
          const stripe = new Stripe(secretKey, {
            // @ts-expect-error Stripe API version string varies by SDK release
            apiVersion: '2025-03-31.basil',
            appInfo: {
              name: 'Nabea Shipping',
              url: 'https://nabea.at',
            },
          })

          const existing = await stripe.paymentIntents.retrieve(paymentIntentID)
          await stripe.paymentIntents.update(paymentIntentID, {
            metadata: {
              ...existing.metadata,
              shippingCents: String(shippingCents),
              productSubtotalCents: String(productSubtotal),
            },
          })
        } catch (err) {
          args.req.payload.logger.error(
            { err, paymentIntentID },
            '[shipping] Failed to attach shipping metadata to PaymentIntent',
          )
        }
      }

      return result
    },
  }
}
