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
            description: 'Pick a color or enter a hex code.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
            components: {
              Field: '@/components/ColorPicker#ColorPicker',
            },
          },
        },
        {
          name: 'textColor',
          type: 'text',
          label: 'Text Color',
          defaultValue: '#ffffff',
          admin: {
            description: 'Pick a color or enter a hex code.',
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
            components: {
              Field: '@/components/ColorPicker#ColorPicker',
            },
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
          includeCategories: true,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'cartSettings',
      label: 'Cart Settings',
      type: 'group',
      admin: {
        description: 'Configure the free shipping bar shown in the cart drawer and cart page.',
      },
      fields: [
        {
          name: 'freeShippingThreshold',
          type: 'number',
          label: 'Free Shipping Threshold (€)',
          defaultValue: 80,
          admin: {
            description: 'Order value in euros required for free shipping.',
          },
        },
        {
          name: 'freeShippingText',
          type: 'text',
          label: 'Free Shipping Label',
          defaultValue: 'Kostenloser Versand ab',
          admin: {
            description: 'Text shown before the threshold amount in the cart.',
          },
        },
        {
          name: 'freeShippingReachedText',
          type: 'text',
          label: 'Free Shipping Reached Text',
          defaultValue: 'Kostenloser Versand!',
          admin: {
            description: 'Text shown when free shipping threshold is reached.',
          },
        },
      ],
    },
  ],
}
