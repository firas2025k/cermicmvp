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
          name: 'linkType',
          type: 'radio',
          label: 'Link to',
          defaultValue: 'custom',
          options: [
            { label: 'Custom URL', value: 'custom' },
            { label: 'Product', value: 'product' },
          ],
          admin: {
            layout: 'horizontal',
          },
        },
        {
          name: 'link',
          type: 'text',
          label: 'Custom URL',
          defaultValue: '/shop',
          admin: {
            condition: (_, siblingData) => siblingData?.linkType !== 'product',
          },
        },
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          label: 'Product',
          admin: {
            description: 'Pick a product to link to. The button will go to that product page.',
            condition: (_, siblingData) => siblingData?.linkType === 'product',
          },
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

