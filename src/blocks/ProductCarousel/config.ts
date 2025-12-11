import type { Block } from 'payload'

export const ProductCarouselBlock: Block = {
  slug: 'productCarousel',
  interfaceName: 'ProductCarouselBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
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
      defaultValue: 8,
      label: 'Limit',
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
  ],
  labels: {
    plural: 'Product Carousels',
    singular: 'Product Carousel',
  },
}

