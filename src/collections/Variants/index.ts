import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection.admin,
    defaultColumns: ['title', 'sku', 'inventory', '_status'],
  },
  fields: [
    {
      name: 'sku',
      type: 'text',
      index: true,
      unique: true,
      admin: {
        description: 'Unique stock code for this variant (for inventory and operations).',
      },
    },
    ...defaultCollection.fields,
  ],
})
