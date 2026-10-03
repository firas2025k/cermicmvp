import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { s3Storage } from '@payloadcms/storage-s3'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { CategoryProductOrder } from '@/collections/CategoryProductOrder'
import { Coupons } from '@/collections/Coupons'
import { Customers } from '@/collections/Customers'
import { Discounts } from '@/collections/Discounts'
import { Invoices } from '@/collections/Invoices'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { StockNotifications } from '@/collections/StockNotifications'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { Homepage } from '@/globals/Homepage'
import { ProductFaqSection } from '@/globals/ProductFaqSection'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Pages,
    Categories,
    CategoryProductOrder,
    Media,
    StockNotifications,
    Discounts,
    Coupons,
    Customers,
    Invoices,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'contact@nabea.at',
        defaultFromName: process.env.RESEND_FROM_NAME || 'Nabea',
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,
  endpoints: [],
  globals: [Header, Footer, Homepage, ProductFaqSection],
  plugins: [
    ...plugins,
    // Cloudflare R2 via S3 API (Vercel/Node). Do NOT use @payloadcms/storage-r2 (Workers-only).
    // https://payloadcms.com/docs/upload/storage-adapters#using-with-cloudflare-r2-via-s3-api
    s3Storage({
      enabled: Boolean(process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID),
      bucket: process.env.R2_BUCKET || '',
      collections: {
        [Media.slug]: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const base = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')
            const key = prefix ? `${prefix}/${filename}` : filename
            return `${base}/${key}`
          },
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
