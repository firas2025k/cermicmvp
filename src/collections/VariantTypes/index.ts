import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

/**
 * Payload ecommerce hides variantTypes from the admin nav by default (`group: false`).
 * Expose it under Ecommerce so editors can manage global sizes/colors without opening a product.
 */
export const VariantTypesCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection.admin,
    group: 'Ecommerce',
    useAsTitle: 'label',
  },
  labels: {
    plural: 'Global Variants',
    singular: 'Global Variant',
  },
})
