import type { GlobalConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { revalidatePath, revalidateTag } from 'next/cache'

export const FEATURE_ICON_OPTIONS = [
  { label: 'Knife-friendly (Messerfreundlich)', value: 'knifeFriendly' },
  { label: 'Colorful grain (Farbenprächtig)', value: 'colorfulGrain' },
  { label: 'Food-safe (Lebensmittelecht)', value: 'foodSafe' },
  { label: 'Antibacterial (Antibakteriell)', value: 'antibacterial' },
  { label: 'Easy care (Pflegeleicht)', value: 'easyCare' },
] as const

export type FeatureIconValue = (typeof FEATURE_ICON_OPTIONS)[number]['value']

export const ProductFaqSection: GlobalConfig = {
  slug: 'product-faq-section',
  label: 'Product FAQ Section',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    description:
      'General FAQ block shown on product pages when “Show general FAQ section” is enabled on a product. Icon graphics are fixed — only labels are editable.',
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
          'Up to 5 features. Pick a built-in icon and edit the label. Leave empty to hide the icon row.',
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
      defaultValue: "FAQ'S",
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
