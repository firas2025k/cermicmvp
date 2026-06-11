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
    defaultPopulate: {
      ...defaultCollection?.defaultPopulate,
      title: true,
      priceInEUR: true,
      compareAtPriceInEUR: true,
      inventory: true,
      options: true,
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
        hooks: {
          beforeChange: [
            ({ value }) => {
              // Convert euros to cents if value is less than 100 (likely in euros)
              if (typeof value === 'number' && value > 0 && value < 100) {
                return Math.round(value * 100)
              }
              return value
            },
          ],
        },
        admin: {
          description: 'Original price shown as strikethrough. Enter value in euros (e.g., 30 for €30.00).',
          step: 0.01,
        },
      },
      ...defaultCollection.fields,
    ],
  }
}
