import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const CartsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...defaultCollection?.hooks,
    beforeChange: [
      ...(defaultCollection?.hooks?.beforeChange || []),
      ({ data, operation }) => {
        // Ensure currency is always set to EUR on create and update
        if (data && typeof data === 'object' && 'currency' in data) {
          data.currency = 'EUR' as any
        }
        return data
      },
    ],
  },
})

