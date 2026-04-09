import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { CollectionBeforeChangeHook } from 'payload'

import { autoGenerateVariantSku } from './autoGenerateSku'

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => {
  const existingBefore = defaultCollection.hooks?.beforeChange
  const beforeChangeChain: CollectionBeforeChangeHook[] = [
    ...(Array.isArray(existingBefore) ? existingBefore : existingBefore ? [existingBefore] : []),
    autoGenerateVariantSku,
  ]

  return {
    ...defaultCollection,
    admin: {
      ...defaultCollection.admin,
      defaultColumns: ['title', 'sku', 'inventory', '_status'],
    },
    hooks: {
      ...defaultCollection.hooks,
      beforeChange: beforeChangeChain,
    },
    fields: [
      {
        name: 'sku',
        type: 'text',
        index: true,
        unique: true,
        admin: {
          description:
            'Optional. Leave blank to auto-generate from product slug + variant option values (unique). You can still set a custom code.',
        },
      },
      ...defaultCollection.fields,
    ],
  }
}
