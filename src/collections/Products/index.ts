import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
    MetaDescriptionField,
    MetaImageField,
    MetaTitleField,
    OverviewField,
    PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
    FixedToolbarFeature,
    HeadingFeature,
    HorizontalRuleFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Field } from 'payload'
import { DefaultDocumentIDType, slugField, Where } from 'payload'

/**
 * - Inventory: plugin hides it when variants are enabled; keep it visible.
 * - Variants join: for single-collection joins Payload defaults `disableRowTypes` so row actions (delete) stay hidden; force them on.
 */
function patchEcommerceProductDetailFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if ('name' in field && field.name === 'variantTypes') {
      const prevAdmin =
        field.admin && typeof field.admin === 'object' ? { ...field.admin } : {}
      return {
        ...field,
        label: 'Global Variants',
        admin: {
          ...prevAdmin,
          position: 'sidebar',
          description:
            'Variant types shared across the shop (e.g. Size). Add options on each type — then pick which combinations this product sells under Product Variants.',
        },
      } as Field
    }
    if ('name' in field && field.name === 'inventory') {
      const prevAdmin =
        field.admin && typeof field.admin === 'object' ? { ...field.admin } : {}
      return {
        ...field,
        admin: {
          ...prevAdmin,
          condition: () => true,
          description:
            (prevAdmin as { description?: string }).description ??
            'Product-level stock. Each variant can also have its own inventory below.',
        },
      } as Field
    }
    if ('name' in field && field.name === 'variants' && field.type === 'join') {
      const prevAdmin =
        field.admin && typeof field.admin === 'object' ? { ...field.admin } : {}
      return {
        ...field,
        label: 'Product Variants',
        admin: {
          ...prevAdmin,
          disableRowTypes: false,
          defaultColumns: ['title', 'options', 'inventory', '_status', 'deleteAction'],
          description:
            'Combinations sold on this product only. These are what customers see on the product page — not every option from Global Variants.',
        },
      } as Field
    }
    return field
  })
}

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'enableVariants', '_status', 'variants.variants'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    priceInEUR: true,
    inventory: true,
    meta: true,
    trustBullets: true,
    faqItems: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map((item: any) => {
                        if (typeof item === 'object' && item?.id) {
                          return item.id
                        }
                        return item
                      }) as DefaultDocumentIDType[]

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },

            {
              name: 'trustBullets',
              type: 'array',
              label: 'Trust Badges',
              admin: {
                description:
                  'Short trust statements shown below the Add to Cart button (e.g. "Free shipping on orders over € 50"). Leave empty to use the site-wide defaults.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  label: 'Text',
                },
              ],
            },
            {
              name: 'faqItems',
              type: 'array',
              label: 'FAQ',
              admin: {
                description:
                  'Frequently asked questions shown in the accordion below the Add to Cart button. Leave empty to use the site-wide defaults.',
              },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  required: true,
                  label: 'Question',
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  required: true,
                  label: 'Answer',
                },
              ],
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            ...patchEcommerceProductDetailFields(defaultCollection.fields),
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
            {
              name: 'compareAtPriceInEUR',
              type: 'number',
              label: 'Compare-at Price (EUR)',
              admin: {
                description: 'Original price shown as strikethrough when higher than regular price. Used for sales.',
                step: 0.01,
              },
            },
          ],
          label: 'Product Details',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    slugField(),
  ],
})
