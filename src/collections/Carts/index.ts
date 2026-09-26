import type { CollectionBeforeChangeHook } from 'payload'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

import {
  calculateCouponDiscountCents,
  type CouponType,
} from '@/utilities/coupons'

/**
 * Ecommerce plugin beforeChange sets subtotal to 0 when `items` is missing from the
 * update payload. Coupon apply/remove (and other partial updates) must therefore
 * re-attach existing items so the plugin can recompute the real merchandise subtotal.
 */
const ensureCartItemsAndCurrency: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (!data || typeof data !== 'object') return data

  if (operation === 'update' && originalDoc) {
    if (!data.currency && 'currency' in originalDoc) {
      const existing = (originalDoc as { currency?: string | null }).currency
      if (existing) data.currency = existing
    }

    const itemsMissing = !('items' in data) || data.items == null
    const originalItems = (originalDoc as { items?: unknown }).items
    if (itemsMissing && Array.isArray(originalItems)) {
      data.items = originalItems
    }
  }

  if (!data.currency) {
    data.currency = 'EUR'
  }

  return data
}

/**
 * After the plugin recomputes subtotal from items, refresh the coupon discount so
 * percentage codes always track the full current merchandise subtotal.
 */
const syncCouponDiscountFromSubtotal: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data || typeof data !== 'object') return data

  const typeRaw =
    typeof data.couponType === 'string'
      ? data.couponType
      : typeof originalDoc?.couponType === 'string'
        ? originalDoc.couponType
        : null

  const valueFromData = data.couponValue
  const valueFromOriginal = originalDoc?.couponValue
  const valueRaw =
    typeof valueFromData === 'number' || typeof valueFromData === 'string'
      ? valueFromData
      : typeof valueFromOriginal === 'number' || typeof valueFromOriginal === 'string'
        ? valueFromOriginal
        : null

  const hasCouponCode =
    (typeof data.couponCode === 'string' && data.couponCode.length > 0) ||
    (typeof originalDoc?.couponCode === 'string' &&
      originalDoc.couponCode.length > 0 &&
      data.couponCode !== null)

  const value = typeof valueRaw === 'number' || typeof valueRaw === 'string'
    ? Number(valueRaw)
    : NaN

  if (
    !hasCouponCode ||
    (typeRaw !== 'percentage' && typeRaw !== 'fixed') ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return data
  }

  const subtotal =
    typeof data.subtotal === 'number' && Number.isFinite(data.subtotal)
      ? data.subtotal
      : typeof data.subtotal === 'string'
        ? Number(data.subtotal)
        : typeof originalDoc?.subtotal === 'number'
          ? originalDoc.subtotal
          : 0

  data.couponDiscountCents = calculateCouponDiscountCents(
    Number.isFinite(subtotal) ? subtotal : 0,
    {
      type: typeRaw as CouponType,
      value,
    },
  )

  // Keep snapshot fields present on partial updates.
  if (data.couponType == null) data.couponType = typeRaw
  if (data.couponValue == null) data.couponValue = value
  if (data.couponCode == null && typeof originalDoc?.couponCode === 'string') {
    data.couponCode = originalDoc.couponCode
  }

  return data
}

export const CartsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  fields: [
    ...(defaultCollection.fields ?? []),
    {
      name: 'appliedCoupon',
      type: 'relationship',
      relationTo: 'coupons',
      label: 'Applied coupon',
      admin: {
        description: 'Coupon currently applied to this cart.',
        position: 'sidebar',
      },
    },
    {
      name: 'couponCode',
      type: 'text',
      label: 'Coupon code snapshot',
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
      label: 'Coupon type snapshot',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'couponValue',
      type: 'number',
      label: 'Coupon value snapshot',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    ...defaultCollection?.hooks,
    beforeChange: [
      ensureCartItemsAndCurrency,
      ...(defaultCollection?.hooks?.beforeChange || []),
      syncCouponDiscountFromSubtotal,
    ],
  },
})
