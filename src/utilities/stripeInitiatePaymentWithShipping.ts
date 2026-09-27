import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import Stripe from 'stripe'

import {
  calculateCouponDiscountCents,
  calculateTotalsWithCoupon,
  validateCouponForCart,
  type CouponType,
} from '@/utilities/coupons'

type CartForPayment = {
  id?: number | string
  subtotal?: number
  items?: unknown
  couponCode?: string | null
  couponDiscountCents?: number | null
  couponType?: string | null
  couponValue?: number | null
  appliedCoupon?: number | { id: number | string } | null
}

/**
 * The plugin initiatePayment handler only selects id/currency/items/subtotal.
 * Coupon fields are omitted, so without a reload every PaymentIntent would charge
 * the undiscounted merchandise + shipping while UI/emails still show the coupon.
 */
async function loadCartWithCouponFields(
  payload: Parameters<PaymentAdapter['initiatePayment']>[0]['req']['payload'],
  req: Parameters<PaymentAdapter['initiatePayment']>[0]['req'],
  cart: CartForPayment,
): Promise<CartForPayment> {
  if (cart.id == null) return cart

  try {
    const fresh = await payload.findByID({
      collection: 'carts',
      id: cart.id,
      depth: 0,
      overrideAccess: true,
      req,
      select: {
        id: true,
        subtotal: true,
        items: true,
        couponCode: true,
        couponDiscountCents: true,
        couponType: true,
        couponValue: true,
        appliedCoupon: true,
      },
    })

    if (!fresh) return cart

    return {
      ...cart,
      subtotal: typeof fresh.subtotal === 'number' ? fresh.subtotal : cart.subtotal,
      couponCode: fresh.couponCode ?? null,
      couponDiscountCents:
        typeof fresh.couponDiscountCents === 'number' ? fresh.couponDiscountCents : null,
      couponType: fresh.couponType ?? null,
      couponValue: typeof fresh.couponValue === 'number' ? fresh.couponValue : null,
      appliedCoupon: fresh.appliedCoupon ?? null,
      ...(Array.isArray(fresh.items) ? { items: fresh.items } : {}),
    }
  } catch (err) {
    payload.logger.error(
      { err, cartId: cart.id },
      '[coupons] Failed to reload cart coupon fields at payment initiate',
    )
    return cart
  }
}

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
      const cart = await loadCartWithCouponFields(
        args.req.payload,
        args.req,
        args.data.cart as CartForPayment,
      )

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
                // Keep items so plugin beforeChange does not zero subtotal.
                ...(Array.isArray(cart.items) ? { items: cart.items as never } : {}),
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
            // Charge the discounted merchandise + shipping (not raw cart.subtotal).
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

          // Belt-and-suspenders: force PI amount to the discounted total before confirm.
          const updatePayload: Stripe.PaymentIntentUpdateParams = {
            metadata: {
              ...existing.metadata,
              shippingCents: String(totals.shippingCents),
              productSubtotalCents: String(totals.payableMerchandiseCents),
              merchandiseSubtotalCents: String(totals.merchandiseSubtotalCents),
              couponDiscountCents: String(totals.couponDiscountCents),
              couponCode,
            },
          }

          if (existing.amount !== totals.chargeTotalCents && totals.chargeTotalCents > 0) {
            updatePayload.amount = totals.chargeTotalCents
            args.req.payload.logger.warn(
              {
                paymentIntentID,
                previousAmount: existing.amount,
                correctedAmount: totals.chargeTotalCents,
                couponCode,
                couponDiscountCents: totals.couponDiscountCents,
              },
              '[coupons] Corrected PaymentIntent amount to include coupon discount',
            )

            // Keep the pending transaction in sync with the corrected charge.
            try {
              const tx = await args.req.payload.find({
                collection: 'transactions',
                where: { 'stripe.paymentIntentID': { equals: paymentIntentID } },
                limit: 1,
                depth: 0,
                overrideAccess: true,
                req: args.req,
              })
              const txDoc = tx.docs[0]
              if (txDoc?.id != null) {
                await args.req.payload.update({
                  collection: 'transactions',
                  id: txDoc.id,
                  data: { amount: totals.chargeTotalCents },
                  overrideAccess: true,
                  req: args.req,
                })
              }
            } catch (txErr) {
              args.req.payload.logger.error(
                { err: txErr, paymentIntentID },
                '[coupons] Failed to sync transaction amount after PaymentIntent correction',
              )
            }
          }

          await stripe.paymentIntents.update(paymentIntentID, updatePayload)
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
