import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { AboutUsAdminPreview } from './AdminPreview'

export const AboutUsBlock: Block = {
  slug: 'aboutUs',
  interfaceName: 'AboutUsBlock',
  admin: {
    components: {
      BeforeInput: [AboutUsAdminPreview],
    },
    description: 'About us section with image, rich text content, and team information.',
  },
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

