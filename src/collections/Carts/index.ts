import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

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
      ({ data, operation, originalDoc }) => {
        if (!data || typeof data !== 'object') {
          return data
        }
        // Plugin subtotal hook uses `priceIn${data.currency}`. Add-item updates often send only `items`,
        // so currency can be missing and crash the server (priceInundefined).
        if (operation === 'update' && !data.currency && originalDoc && 'currency' in originalDoc) {
          const existing = (originalDoc as { currency?: string | null }).currency
          if (existing) {
            data.currency = existing
          }
        }
        // Default new carts / explicit EUR for this shop
        if (!data.currency) {
          data.currency = 'EUR'
        }
        return data
      },
      ...(defaultCollection?.hooks?.beforeChange || []),
    ],
  },
})
