import type { CollectionConfig, FieldHook } from 'payload'

const applyDiscountLogic: FieldHook = async ({ data, req, operation }) => {
  // This hook runs after save to validate discount logic
  // Main calculation happens in Products beforeRead
  return data
}

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'discountPercent', 'applyTo', 'status', 'enabled'],
    group: 'Shop',
    description: 'Create and manage sales, promotions, and percentage-based discounts.',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Discount Name',
      required: true,
      admin: {
        description: 'Internal name for this discount, e.g., "Summer Sale 2024"',
      },
    },
    {
      name: 'discountPercent',
      type: 'number',
      label: 'Discount Percentage',
      required: true,
      min: 1,
      max: 99,
      admin: {
        description: 'Percentage off regular price, e.g., 20 for 20% off',
        step: 1,
      },
    },
    {
      name: 'applyTo',
      type: 'select',
      label: 'Applies To',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'All Products', value: 'all' },
        { label: 'Specific Products', value: 'products' },
        { label: 'Specific Categories', value: 'categories' },
      ],
      admin: {
        description: 'Choose which products this discount applies to.',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      label: 'Select Products',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Choose specific products for this discount.',
        condition: (data) => data?.applyTo === 'products',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      label: 'Select Categories',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'All products in these categories will be discounted.',
        condition: (data) => data?.applyTo === 'categories',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      required: true,
      admin: {
        description: 'When this discount becomes active.',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date (Optional)',
      admin: {
        description: 'When this discount ends. Leave blank for ongoing discounts.',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enabled',
      defaultValue: true,
      admin: {
        description: 'Turn on/off without deleting the discount.',
      },
    },
    {
      name: 'status',
      type: 'ui',
      label: 'Status',
      admin: {
        components: {
          Field: '@/components/admin/DiscountStatus#DiscountStatusField',
        },
      },
    },
  ],
}
