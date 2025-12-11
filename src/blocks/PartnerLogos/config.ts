import type { Block } from 'payload'

export const PartnerLogosBlock: Block = {
  slug: 'partnerLogos',
  interfaceName: 'PartnerLogosBlock',
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
    singular: 'Partner Logos',
  },
}

