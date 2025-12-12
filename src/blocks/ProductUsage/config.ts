import type { Block } from 'payload'

export const ProductUsageBlock: Block = {
  slug: 'productUsage',
  interfaceName: 'ProductUsageBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Usage Items',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link',
          defaultValue: '/shop',
        },
        {
          name: 'linkText',
          type: 'text',
          label: 'Link Text',
          defaultValue: 'Mehr erfahren',
        },
      ],
    },
  ],
  labels: {
    plural: 'Product Usage',
    singular: '💚 Product Usage',
  },
}

