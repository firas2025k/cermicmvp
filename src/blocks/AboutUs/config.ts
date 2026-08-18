import {
    FixedToolbarFeature,
    HeadingFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const AboutUsBlock: Block = {
  slug: 'aboutUs',
  interfaceName: 'AboutUsBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      defaultValue: 'Über uns',
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
      defaultValue: 'Unser Team',
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Image Position',
      defaultValue: 'imageLeft',
      admin: {
        description:
          'Choose whether the image sits on the left or the right. Use opposite sides on stacked sections so the homepage does not look repetitive.',
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
      label: '"Learn More" Button Label',
      defaultValue: 'Learn More',
      admin: {
        description: 'Text shown on the button. Leave empty to hide the button.',
      },
    },
    {
      name: 'learnMoreUrl',
      type: 'text',
      label: '"Learn More" Button URL',
      defaultValue: '/shop',
      admin: {
        description: 'Where the button links to, e.g. /ueber-uns or /shop.',
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
    plural: 'About Us',
    singular: '👥 About Us',
  },
}

