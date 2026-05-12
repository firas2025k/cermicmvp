import type { Block } from 'payload'

export const MarqueeStripBlock: Block = {
  slug: 'marqueeStrip',
  interfaceName: 'MarqueeStripBlock',
  labels: {
    singular: '📢 Marquee Strip',
    plural: '📢 Marquee Strips',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Marquee Items',
      minRows: 1,
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      admin: {
        description: 'Each item scrolls across the bar separated by a ✦ dot. The list repeats seamlessly.',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          label: 'Text',
          admin: {
            placeholder: 'e.g. Free Shipping over €50',
          },
        },
      ],
    },
  ],
}
