import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'promotionalBanner',
      label: 'Promotional Banner',
      type: 'group',
      admin: {
        description: 'The small banner at the top of every page. Toggle visibility, edit content, and customize colors.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show Banner',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide the banner completely.',
          },
        },
        {
          name: 'content',
          type: 'text',
          label: 'Banner Text',
          defaultValue: 'Kostenloser Versand ab 50€ Bestellwert',
          admin: {
            description: 'Edit or delete this text to change the banner message.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Background Color',
          defaultValue: '#991b1b',
          admin: {
            description: 'Hex color (e.g. #991b1b for red). Leave empty for default.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'textColor',
          type: 'text',
          label: 'Text Color',
          defaultValue: '#ffffff',
          admin: {
            description: 'Hex color (e.g. #ffffff for white). Leave empty for default.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
      ],
    },
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
