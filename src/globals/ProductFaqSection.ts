import type { GlobalConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { revalidatePath, revalidateTag } from 'next/cache'

import { FEATURE_ICON_OPTIONS } from '@/utilities/featureIcons'

export type { FeatureIconValue } from '@/utilities/featureIcons'
export { FEATURE_ICON_OPTIONS } from '@/utilities/featureIcons'

export const ProductFaqSection: GlobalConfig = {
  slug: 'product-faq-section',
  label: 'Product FAQ Section',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    description:
      'General FAQ block shown on product pages when “Show general FAQ section” is enabled on a product. Choose a Lucide icon visually and edit each label.',
  },
  fields: [
    {
      name: 'featureIcons',
      type: 'array',
      label: 'Feature Icons',
      maxRows: 5,
      minRows: 0,
      admin: {
        description:
          'Up to 5 features. Click an icon to select it, then edit the label. Leave empty to hide the icon row.',
        initCollapsed: false,
      },
      defaultValue: [
        { icon: 'knifeFriendly', label: 'Messerfreundlich' },
        { icon: 'colorfulGrain', label: 'Farbenprächtig' },
        { icon: 'foodSafe', label: 'Lebensmittelecht' },
        { icon: 'antibacterial', label: 'Antibakteriell' },
        { icon: 'easyCare', label: 'Pflegeleicht' },
      ],
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icon',
          required: true,
          options: [...FEATURE_ICON_OPTIONS],
          defaultValue: 'knifeFriendly',
          admin: {
            description: 'Click an icon to select it for this feature.',
            components: {
              Field: '@/components/admin/FeatureIconPicker#FeatureIconPicker',
            },
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
        },
      ],
    },
    {
      name: 'heading',
      type: 'text',
      label: 'FAQ Heading',
      defaultValue: 'Häufig gestellte Fragen',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'FAQ Image',
      admin: {
        description: 'Lifestyle image shown on the left of the FAQ accordion.',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'FAQ Items',
      labels: {
        singular: 'FAQ Item',
        plural: 'FAQ Items',
      },
      admin: {
        description: 'Questions and answers for the general product FAQ accordion.',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Question',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          label: 'Answer',
          required: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req }) => {
        req.payload.logger.info('Revalidating product FAQ section')
        revalidateTag('global_product-faq-section')
        revalidatePath('/products', 'layout')
        return doc
      },
    ],
  },
}
