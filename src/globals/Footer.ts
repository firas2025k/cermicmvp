import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'brand',
      label: 'Brand',
      type: 'group',
      fields: [
        {
          name: 'tagline',
          type: 'text',
          label: 'Tagline',
          defaultValue: 'Handcrafted olive wood and ceramic pieces, made with care in Austria.',
          admin: {
            description: 'Short description shown below the logo in the footer.',
          },
        },
      ],
    },
    {
      name: 'contactInfo',
      label: 'Contact Information',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Address',
          defaultValue: 'Wien, Österreich',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          defaultValue: 'hello@nabea.at',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
      ],
    },
    {
      name: 'socialLinks',
      label: 'Social Media Links',
      type: 'array',
      admin: {
        description: 'Add links to social media profiles.',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Platform',
          required: true,
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Pinterest', value: 'pinterest' },
            { label: 'YouTube', value: 'youtube' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
      ],
    },
    {
      name: 'legalLinks',
      label: 'Legal Links',
      type: 'array',
      admin: {
        description: 'Links for Impressum, Datenschutz, AGB, etc.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL or path',
          required: true,
        },
      ],
    },
    {
      name: 'newsletter',
      label: 'Newsletter',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show Newsletter Section',
          defaultValue: false,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Newsletter Title',
          defaultValue: 'Stay in the loop',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'description',
          type: 'text',
          label: 'Newsletter Description',
          defaultValue: 'New arrivals, stories, and updates — straight to your inbox.',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
      ],
    },
    {
      name: 'navItems',
      label: 'Navigate Links',
      type: 'array',
      admin: {
        description: 'Links shown in the "Navigate" column of the footer.',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 10,
    },
  ],
}
