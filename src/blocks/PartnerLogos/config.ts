import type { Block } from 'payload'
import { PartnerLogosAdminPreview } from './AdminPreview'

export const PartnerLogosBlock: Block = {
  slug: 'partnerLogos',
  interfaceName: 'PartnerLogosBlock',
  admin: {
    components: {
      BeforeInput: [PartnerLogosAdminPreview],
    },
    description: 'Showcase partner logos and brands. Optional 5-star rating display.',
  },
  fields: [
    {
      name: 'partners',
      type: 'array',
      label: 'Partners',
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Partner Name',
          required: true,
        },
      ],
    },
    {
      name: 'showRating',
      type: 'checkbox',
      label: 'Show Rating',
      defaultValue: true,
    },
  ],
  labels: {
    plural: 'Partner Logos',
    singular: '🤝 Partner Logos',
  },
}

