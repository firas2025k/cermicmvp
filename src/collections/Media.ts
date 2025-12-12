import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  admin: {
    group: 'Content',
  },
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  // Use local storage in development (when BLOB_READ_WRITE_TOKEN is not set)
  // Use Vercel Blob Storage in production (when BLOB_READ_WRITE_TOKEN is set)
  ...(!process.env.BLOB_READ_WRITE_TOKEN && {
    upload: {
      staticDir: path.resolve(dirname, '../../public/media'),
    },
  }),
}
