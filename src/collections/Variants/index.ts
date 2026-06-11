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
        name: 'deleteAction',
        type: 'ui',
        label: 'Delete',
        admin: {
          disableBulkEdit: true,
          disableListFilter: true,
          components: {
            Cell: '@/components/admin/VariantDeleteCell#VariantDeleteCell',
          },
        },
      },
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
      {
        name: 'compareAtPriceInEUR',
        type: 'number',
        label: 'Compare-at Price (EUR)',
        admin: {
          description: 'Original price shown as strikethrough when higher than regular price. Used for sales.',
          step: 0.01,
        },
      },
      ...defaultCollection.fields,
    ],
  }
}
