import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const InquiryBlock: Block = {
  slug: 'inquiry',
  interfaceName: 'InquiryBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'Anfragen',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
    },
    {
      name: 'imageCaption',
      type: 'text',
      label: 'Image Caption',
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Image Position',
      defaultValue: 'imageRight',
      admin: {
        description:
          'Choose whether the image sits on the left or the right. Use the opposite of About Us so stacked sections do not look repetitive.',
      },
      options: [
        {
          label: 'Image left / text right',
          value: 'imageLeft',
        },
        {
          label: 'Text left / image right',
          value: 'imageRight',
        },
      ],
    },
    {
      name: 'learnMoreLabel',
      type: 'text',
      label: 'Button Label',
      defaultValue: 'Unverbindlich anfragen',
      admin: {
        description: 'Text shown on the button. Leave empty to hide the button.',
      },
    },
    {
      name: 'learnMoreUrl',
      type: 'text',
      label: 'Button URL',
      defaultValue: '/anfrage',
      admin: {
        description: 'Where the button links to, e.g. /anfrage.',
        condition: (_, siblingData) => Boolean(siblingData?.learnMoreLabel),
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      required: true,
    },
  ],
  labels: {
    plural: 'Inquiry',
    singular: '✉️ Inquiry',
  },
}
