import type { Order, User } from '@/payload-types'
import type { Payload, PayloadRequest } from 'payload'

import { resolveCustomerEmail, resolveCustomerEmailForSend } from '@/utilities/orderEmails'

type Shipping = NonNullable<Order['shippingAddress']>

const trim = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const next = value.trim()
  return next.length > 0 ? next : null
}

const displayNameFromShipping = (shipping?: Shipping | null): string | null => {
  if (!shipping) return null
  const name = [trim(shipping.firstName), trim(shipping.lastName)].filter(Boolean).join(' ')
  return name.length > 0 ? name : null
}

/**
 * Find-or-create a Shop Customer from an order's email + shipping details.
 * Returns the customer id, or null if no email can be resolved.
 */
export async function upsertShopCustomerFromOrder(
  payload: Payload,
  order: Order,
  options?: { req?: PayloadRequest },
): Promise<number | string | null> {
  const email =
    (await resolveCustomerEmailForSend(payload, order, {
      req: options?.req,
      // Avoid nested order updates while syncing customer from an order hook.
      backfill: false,
    })) || resolveCustomerEmail(order)

  if (!email) {
    payload.logger.warn(
      { orderId: order.id },
      '[customers] Skipping shop customer upsert — no email on order',
    )
    return null
  }

  const shipping = order.shippingAddress
  const firstName = trim(shipping?.firstName)
  const lastName = trim(shipping?.lastName)
  const displayName = displayNameFromShipping(shipping) || email
  const phone = trim(shipping?.phone)
  const company = trim(shipping?.company)

  const userId =
    order.customer && typeof order.customer === 'object'
      ? (order.customer as User).id
      : order.customer

  const data: Record<string, unknown> = {
    email,
    displayName,
    firstName,
    lastName,
    phone,
    company,
    hasAccount: userId != null,
    shippingAddress: {
      addressLine1: trim(shipping?.addressLine1),
      addressLine2: trim(shipping?.addressLine2),
      city: trim(shipping?.city),
      state: trim(shipping?.state),
      postalCode: trim(shipping?.postalCode),
      country: trim(shipping?.country),
    },
  }

  if (userId != null) {
    data.user = userId
  }

  const reqOpts = options?.req ? { req: options.req } : {}

  try {
    const existing = await payload.find({
      collection: 'customers',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      ...reqOpts,
    })

    const found = existing.docs[0]

    if (found) {
      // Keep admin notes; only refresh identity/shipping from the latest order.
      await payload.update({
        collection: 'customers',
        id: found.id,
        data,
        overrideAccess: true,
        ...reqOpts,
      })
      return found.id
    }

    const created = await payload.create({
      collection: 'customers',
      data: data as never,
      overrideAccess: true,
      ...reqOpts,
    })

    return created.id
  } catch (err) {
    payload.logger.error({ err, orderId: order.id, email }, '[customers] Upsert failed')
    return null
  }
}
