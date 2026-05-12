import type { Block } from 'payload'

const panelFields = [
  {
    name: 'image',
    type: 'upload' as const,
    relationTo: 'media' as const,
    required: true,
    label: 'Background Image',
  },
  {
    name: 'eyebrow',
    type: 'text' as const,
    label: 'Eyebrow Label',
    admin: {
      description: 'Small uppercase label above the title, e.g. "New Collection"',
    },
  },
  {
    name: 'title',
    type: 'text' as const,
    required: true,
    label: 'Title',
    admin: {
      description: 'Main heading, e.g. "Olive Wood Essentials"',
    },
  },
  {
    name: 'buttonText',
    type: 'text' as const,
    label: 'Button Text',
    defaultValue: 'Shop Now',
  },
  {
    name: 'buttonLink',
    type: 'text' as const,
    label: 'Button Link',
    defaultValue: '/shop',
  },
]

export const HeroSplitBlock: Block = {
  slug: 'heroSplit',
  interfaceName: 'HeroSplitBlock',
  labels: {
    singular: '✦ Hero — Split Panels',
    plural: '✦ Hero — Split Panels',
  },
  fields: [
    {
      name: 'leftPanel',
      type: 'group',
      label: 'Left Panel',
      fields: panelFields,
    },
    {
      name: 'rightPanel',
      type: 'group',
      label: 'Right Panel',
      fields: panelFields,
    },
  ],
}
