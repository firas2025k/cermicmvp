import type { CollectionOverride } from '@payloadcms/plugin-ecommerce'

export const VariantOptionsCollection: CollectionOverride = ({ defaultCollection }) => {
  return {
    ...defaultCollection,
    fields: [
      ...defaultCollection.fields,
      {
        name: 'color',
        type: 'text',
        admin: {
          description:
            'Optional hex color code (e.g. #E53935). When set, this option displays as a color swatch on the storefront instead of a text pill.',
        },
      },
    ],
  }
}
