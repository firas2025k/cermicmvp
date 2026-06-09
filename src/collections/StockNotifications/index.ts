import type { CollectionConfig } from 'payload'

export const StockNotifications: CollectionConfig = {
  slug: 'stock-notifications',
  admin: {
    group: 'Shop',
    useAsTitle: 'email',
    description: 'Customers who want to be notified when a product is back in stock.',
    defaultColumns: ['email', 'productTitle', 'variantTitle', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      label: 'Product',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'productTitle',
      type: 'text',
      label: 'Product Title (snapshot)',
      admin: {
        description: 'Captured at submission time for easy reading in the admin.',
        readOnly: true,
      },
    },
    {
      name: 'variantId',
      type: 'number',
      label: 'Variant ID',
      admin: {
        description: 'The specific variant (size/option) the customer wants, if applicable.',
      },
    },
    {
      name: 'variantTitle',
      type: 'text',
      label: 'Variant Title (snapshot)',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notified',
      type: 'checkbox',
      label: 'Notified',
      defaultValue: false,
      admin: {
        description: 'Check when you have manually followed up with this customer.',
      },
    },
  ],
  timestamps: true,
}
