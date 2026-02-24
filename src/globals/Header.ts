import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      label: 'Logo',
      type: 'group',
      fields: [
        {
          name: 'image',
          label: 'Logo image',
          type: 'upload',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'label',
          label: 'Logo text',
          type: 'text',
          required: false,
          defaultValue: 'TUNISIAN TILE STUDIO',
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
