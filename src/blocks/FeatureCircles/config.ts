import type { Block } from 'payload'
import { FeatureCirclesAdminPreview } from './AdminPreview'

export const FeatureCirclesBlock: Block = {
  slug: 'featureCircles',
  interfaceName: 'FeatureCirclesBlock',
  admin: {
    components: {
      BeforeInput: [FeatureCirclesAdminPreview],
    },
    description: 'Showcase key features with circular images, labels, and descriptions. Great for highlighting benefits.',
  },
  fields: [
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      label: 'Background Color',
      defaultValue: 'red',
      options: [
        {
          label: 'Red Gradient',
          value: 'red',
        },
        {
          label: 'Amber Gradient',
          value: 'amber',
        },
        {
          label: 'Neutral',
          value: 'neutral',
        },
      ],
    },
  ],
  labels: {
    plural: 'Feature Circles',
    singular: '⭕ Feature Circles',
  },
}

