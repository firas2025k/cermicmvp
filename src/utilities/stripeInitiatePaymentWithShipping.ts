import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import Stripe from 'stripe'

import {
  calculateCouponDiscountCents,
  calculateTotalsWithCoupon,
  validateCouponForCart,
  type CouponType,
} from '@/utilities/coupons'

/**
 * Wraps the ecommerce Stripe adapter so PaymentIntent amount includes:
 * - coupon discount (revalidated server-side; recomputed from type/value + subtotal)
 * - flat shipping when payable merchandise is under the free-shipping threshold
 *
 * DB cart.subtotal stays the raw merchandise subtotal; only the value passed into
 * initiatePayment is adjusted.
 */
export function withShippingOnStripeAdapter(
  adapter: PaymentAdapter,
  secretKey: string,
): PaymentAdapter {
  const baseInitiate = adapter.initiatePayment

  return {
    ...adapter,
    initiatePayment: async (args) => {
      const cart = args.data.cart as {
        id?: number | string
        subtotal?: number
        couponCode?: string | null
        couponDiscountCents?: number | null
        couponType?: string | null
        couponValue?: number | null
        appliedCoupon?: number | { id: number | string } | null
      }

      const productSubtotal =
        typeof cart.subtotal === 'number' && Number.isFinite(cart.subtotal) ? cart.subtotal : 0

      const customerEmail =
        typeof (args.data as { customerEmail?: unknown }).customerEmail === 'string'
          ? (args.data as { customerEmail: string }).customerEmail
          : null

      let couponDiscountCents = 0
      let couponCode =
        typeof cart.couponCode === 'string' && cart.couponCode.trim() ? cart.couponCode.trim() : ''

      if (couponCode) {
        const validated = await validateCouponForCart({
          payload: args.req.payload,
          req: args.req,
          code: couponCode,
          merchandiseSubtotalCents: productSubtotal,
          customerEmail,
        })

        if (!validated.ok) {
          throw new Error(validated.error)
        }

        couponDiscountCents = validated.discountCents
        couponCode = validated.coupon.code

        if (cart.id != null) {
          try {
            const couponId =
              typeof validated.coupon.id === 'number'
                ? validated.coupon.id
                : Number.parseInt(String(validated.coupon.id), 10)
            await args.req.payload.update({
              collection: 'carts',
              id: cart.id,
              data: {
                appliedCoupon: Number.isFinite(couponId) ? couponId : null,
                couponCode: validated.coupon.code,
                couponDiscountCents: validated.discountCents,
                couponType: validated.coupon.type,
                couponValue: validated.coupon.value,
              },
              overrideAccess: true,
              req: args.req,
            })
          } catch (err) {
            args.req.payload.logger.error(
              { err, cartId: cart.id },
              '[coupons] Failed to refresh cart coupon snapshot at payment initiate',
            )
          }
        }
      } else {
        const couponType =
          cart.couponType === 'percentage' || cart.couponType === 'fixed'
            ? (cart.couponType as CouponType)
            : null
        const couponValue =
          typeof cart.couponValue === 'number' && Number.isFinite(cart.couponValue)
            ? cart.couponValue
            : null

        if (couponType && couponValue != null) {
          couponDiscountCents = calculateCouponDiscountCents(productSubtotal, {
            type: couponType,
            value: couponValue,
          })
        } else if (typeof cart.couponDiscountCents === 'number') {
          couponDiscountCents = Math.max(0, Math.round(cart.couponDiscountCents))
        }
      }

      const totals = calculateTotalsWithCoupon(productSubtotal, couponDiscountCents)

      const result = await baseInitiate({
        ...args,
        data: {
          ...args.data,
          cart: {
            ...args.data.cart,
            subtotal: totals.chargeTotalCents,
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
              shippingCents: String(totals.shippingCents),
              productSubtotalCents: String(totals.payableMerchandiseCents),
              merchandiseSubtotalCents: String(totals.merchandiseSubtotalCents),
              couponDiscountCents: String(totals.couponDiscountCents),
              couponCode,
            },
          })
        } catch (err) {
          args.req.payload.logger.error(
            { err, paymentIntentID },
            '[shipping] Failed to attach shipping/coupon metadata to PaymentIntent',
          )
        }
      }

      return result
    },
  }
}
