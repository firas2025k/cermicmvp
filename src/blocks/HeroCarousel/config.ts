import type { Block } from 'payload'

import { HeroSlideRowLabel } from './HeroSlideRowLabel'

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
      labels: {
        singular: 'Slide',
        plural: 'Slides',
      },
      admin: {
        initCollapsed: false,
        components: {
          RowLabel: HeroSlideRowLabel,
        },
      },
      fields: [
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
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Slide Image',
          admin: {
            description: 'Image for this slide only. Each slide has its own image.',
          },
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

