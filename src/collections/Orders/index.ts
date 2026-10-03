import type { Order } from '@/payload-types'
import {
  isNotifiableOrderStatus,
  sendOrderEmails,
  sendOrderStatusChangeEmail,
} from '@/utilities/orderEmails'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { CollectionAfterChangeHook } from 'payload'

/**
 * After a successful Stripe confirmOrder, the ecommerce plugin creates an order.
 * Send customer Bestellbestätigung + shop alert without blocking/failing the create.
 */
const sendOrderConfirmationEmails: CollectionAfterChangeHook<Order> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  try {
    let order = doc

    // Resolve product/variant titles for the email body.
    // Must pass `req` so the read sees the uncommitted order in the same DB transaction.
    try {
      order = (await req.payload.findByID({
        collection: 'orders',
        id: doc.id,
        depth: 2,
        overrideAccess: true,
        req,
      })) as Order
    } catch (err) {
      req.payload.logger.error(
        { err, orderId: doc.id },
        '[order-emails] Failed to re-fetch order; sending with create payload',
      )
    }

    await sendOrderEmails(req.payload, order, { req })
  } catch (err) {
    req.payload.logger.error(
      { err, orderId: doc.id },
      '[order-emails] Unexpected error while sending order emails',
    )
  }

  return doc
}

/**
 * When admin changes order status to processing / completed / cancelled / refunded, email the customer.
 * Skips create (handled above) and no-ops when status did not change.
 */
const sendOrderStatusChangeEmails: CollectionAfterChangeHook<Order> = async ({
  doc,
  operation,
  previousDoc,
  req,
  context,
}) => {
  if (operation !== 'update') return doc
  if (context?.skipOrderStatusEmail) return doc

  const nextStatus = doc.status
  const prevStatus = previousDoc?.status

  if (!isNotifiableOrderStatus(nextStatus)) return doc
  if (nextStatus === prevStatus) return doc

  try {
    await sendOrderStatusChangeEmail(req.payload, doc, nextStatus)
  } catch (err) {
    req.payload.logger.error(
      { err, orderId: doc.id, status: nextStatus },
      '[order-emails] Unexpected error while sending status-change email',
    )
  }

  return doc
}

/**
 * Increment coupon usage once when an order that used a coupon is created.
 */
const incrementCouponUsage: CollectionAfterChangeHook<Order> = async ({
  doc,
  operation,
  req,
  context,
}) => {
  if (operation !== 'create') return doc
  if (context?.skipCouponUsageIncrement) return doc

  const couponId =
    typeof doc.appliedCoupon === 'object' && doc.appliedCoupon
      ? doc.appliedCoupon.id
      : doc.appliedCoupon

  if (couponId == null) return doc

  try {
    const coupon = await req.payload.findByID({
      collection: 'coupons',
      id: couponId,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const current =
      typeof coupon.usageCount === 'number' && Number.isFinite(coupon.usageCount)
        ? coupon.usageCount
        : 0

    await req.payload.update({
      collection: 'coupons',
      id: couponId,
      data: { usageCount: current + 1 },
      overrideAccess: true,
      req,
      context: { ...context, skipCouponUsageIncrement: true },
    })
  } catch (err) {
    req.payload.logger.error(
      { err, orderId: doc.id, couponId },
      '[coupons] Failed to increment usageCount',
    )
  }

  return doc
}

export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => {
  const existingAfter = defaultCollection.hooks?.afterChange
  const afterChangeChain: CollectionAfterChangeHook[] = [
    ...(Array.isArray(existingAfter) ? existingAfter : existingAfter ? [existingAfter] : []),
    incrementCouponUsage as CollectionAfterChangeHook,
    sendOrderConfirmationEmails as CollectionAfterChangeHook,
    sendOrderStatusChangeEmails as CollectionAfterChangeHook,
  ]

  const existingFields = defaultCollection.fields ?? []

  return {
    ...defaultCollection,
    admin: {
      ...defaultCollection.admin,
      description:
        'Customer orders. Rechnungen (invoice PDFs) are stored under Shop → Invoices after checkout.',
    },
    fields: [
      ...existingFields,
      {
        name: 'shippingAmount',
        type: 'number',
        label: 'Shipping (cents)',
        defaultValue: 0,
        admin: {
          readOnly: true,
          description:
            'Versandkosten in cents at confirm time (€6.90 under €50 subtotal, otherwise 0 / Kostenlos).',
          position: 'sidebar',
        },
      },
      {
        name: 'appliedCoupon',
        type: 'relationship',
        relationTo: 'coupons',
        label: 'Applied coupon',
        admin: {
          readOnly: true,
          position: 'sidebar',
        },
      },
      {
        name: 'couponCode',
        type: 'text',
        label: 'Coupon code',
        admin: {
          readOnly: true,
          position: 'sidebar',
        },
      },
      {
        name: 'couponDiscountCents',
        type: 'number',
        label: 'Coupon discount (cents)',
        defaultValue: 0,
        admin: {
          readOnly: true,
          position: 'sidebar',
        },
      },
      {
        name: 'couponType',
        type: 'text',
        label: 'Coupon type',
        admin: {
          readOnly: true,
          position: 'sidebar',
        },
      },
      {
        name: 'couponValue',
        type: 'number',
        label: 'Coupon value',
        admin: {
          readOnly: true,
          position: 'sidebar',
        },
      },
    ],
    hooks: {
      ...defaultCollection.hooks,
      afterChange: afterChangeChain,
    },
  }
}
