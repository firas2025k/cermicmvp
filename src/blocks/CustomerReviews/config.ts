import type { Block } from 'payload'
import { CustomerReviewsAdminPreview } from './AdminPreview'

export const CustomerReviewsBlock: Block = {
  slug: 'customerReviews',
  interfaceName: 'CustomerReviewsBlock',
  admin: {
    components: {
      BeforeInput: [CustomerReviewsAdminPreview],
    },
    description: 'Display customer reviews with images, ratings, and titles. Perfect for building trust.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Kundenbewertungen',
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      label: 'Show "View All" Button',
      defaultValue: true,
    },
    {
      name: 'viewAllLink',
      type: 'text',
      label: 'View All Link',
      defaultValue: '/reviews',
      admin: {
        condition: (_, siblingData) => siblingData.showViewAll,
      },
    },
    {
      name: 'reviews',
      type: 'array',
      label: 'Reviews',
      minRows: 1,
      maxRows: 8,
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
          label: 'Review Title',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Rating',
          defaultValue: 5,
          min: 1,
          max: 5,
          admin: {
            step: 1,
          },
        },
      ],
    },
  ],
  labels: {
    plural: 'Customer Reviews',
    singular: '⭐ Customer Reviews',
  },
}

