import type { Block } from 'payload'

export const HeroCarouselBlock: Block = {
  slug: 'heroCarousel',
  interfaceName: 'HeroCarouselBlock',
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Hero Slides',
      minRows: 1,
      maxRows: 10,
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
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Subtitle',
        },
        {
          name: 'buttonText',
          type: 'text',
          label: 'Button Text',
        },
        {
          name: 'buttonLink',
          type: 'text',
          label: 'Button Link',
          defaultValue: '/shop',
        },
      ],
    },
    {
      name: 'autoPlay',
      type: 'checkbox',
      label: 'Auto Play',
      defaultValue: true,
    },
    {
      name: 'autoPlayInterval',
      type: 'number',
      label: 'Auto Play Interval (ms)',
      defaultValue: 5000,
      admin: {
        step: 1000,
      },
    },
  ],
  labels: {
    plural: 'Hero Carousels',
    singular: '🖼️ Hero Carousel',
  },
}

