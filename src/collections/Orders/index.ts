import type { Order } from '@/payload-types'
import { sendOrderEmails } from '@/utilities/orderEmails'
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
    try {
      order = (await req.payload.findByID({
        collection: 'orders',
        id: doc.id,
        depth: 2,
        overrideAccess: true,
      })) as Order
    } catch (err) {
      req.payload.logger.error(
        { err, orderId: doc.id },
        '[order-emails] Failed to re-fetch order; sending with create payload',
      )
    }

    await sendOrderEmails(req.payload, order)
  } catch (err) {
    req.payload.logger.error(
      { err, orderId: doc.id },
      '[order-emails] Unexpected error while sending order emails',
    )
  }

  return doc
}

export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => {
  const existingAfter = defaultCollection.hooks?.afterChange
  const afterChangeChain: CollectionAfterChangeHook[] = [
    ...(Array.isArray(existingAfter) ? existingAfter : existingAfter ? [existingAfter] : []),
    sendOrderConfirmationEmails as CollectionAfterChangeHook,
  ]

  return {
    ...defaultCollection,
    hooks: {
      ...defaultCollection.hooks,
      afterChange: afterChangeChain,
    },
  }
}
