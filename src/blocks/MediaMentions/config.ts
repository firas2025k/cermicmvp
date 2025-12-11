import type { Block } from 'payload'
import { MediaMentionsAdminPreview } from './AdminPreview'

export const MediaMentionsBlock: Block = {
  slug: 'mediaMentions',
  interfaceName: 'MediaMentionsBlock',
  admin: {
    components: {
      BeforeInput: [MediaMentionsAdminPreview],
    },
    description: 'Display media outlet mentions and press coverage. Simple text list format.',
  },
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

