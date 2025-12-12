import type { Block } from 'payload'

export const MediaMentionsBlock: Block = {
  slug: 'mediaMentions',
  interfaceName: 'MediaMentionsBlock',
  fields: [
    {
      name: 'outlets',
      type: 'array',
      label: 'Media Outlets',
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Outlet Name',
          required: true,
        },
      ],
    },
  ],
  labels: {
    plural: 'Media Mentions',
    singular: '📰 Media Mentions',
  },
}

