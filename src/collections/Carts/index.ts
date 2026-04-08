import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const CartsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
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

