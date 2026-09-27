import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const ImageTextBlock: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Image Position',
      defaultValue: 'imageLeft',
      admin: {
        description: 'Choose whether the image sits on the left or the right.',
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
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'CTA Button Label',
      admin: {
        description: 'Optional. Leave empty to hide the button.',
      },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      label: 'CTA Button URL',
      admin: {
        description: 'Where the button links to, e.g. /shop or /anfrage.',
        condition: (_, siblingData) => Boolean(siblingData?.ctaLabel),
      },
    },
  ],
  labels: {
    plural: 'Image + Text',
    singular: '🖼 Image + Text',
  },
}
