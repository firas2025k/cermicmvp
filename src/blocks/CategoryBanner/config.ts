import type { Block } from 'payload'
import { CategoryBannerAdminPreview } from './AdminPreview'

export const CategoryBannerBlock: Block = {
  slug: 'categoryBanner',
  interfaceName: 'CategoryBannerBlock',
  admin: {
    components: {
      BeforeInput: [CategoryBannerAdminPreview],
    },
    description: 'Category showcase with product grid and call-to-action. Perfect for highlighting product categories.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        {
          label: 'Collection',
          value: 'collection',
        },
        {
          label: 'Individual Selection',
          value: 'selection',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: 'Categories To Show',
      relationTo: 'categories',
    },
    {
      name: 'sort',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: '-createdAt',
      options: [
        {
          label: 'Newest First',
          value: '-createdAt',
        },
        {
          label: 'Oldest First',
          value: 'createdAt',
        },
        {
          label: 'Title A-Z',
          value: 'title',
        },
        {
          label: 'Title Z-A',
          value: '-title',
        },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 4,
      label: 'Number of Products',
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: 'Selection',
      relationTo: ['products'],
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA Button Text',
      defaultValue: 'Jetzt entdecken',
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'CTA Button Link',
      defaultValue: '/shop',
    },
  ],
  labels: {
    plural: 'Category Banners',
    singular: '🏷️ Category Banner',
  },
}

