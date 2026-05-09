import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Lower numbers appear first. Used to rearrange categories and subcategories.',
      },
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
        description: 'Select a parent category to make this a subcategory. Leave empty for top-level categories.',
      },
      filterOptions: ({ id }) => {
        // Prevent a category from being its own parent
        if (id) {
          return {
            id: {
              not_equals: id,
            },
          }
        }
        return {}
      },
    },
    {
      name: 'productOrder',
      type: 'join',
      collection: 'category-product-orders',
      on: 'category',
      maxDepth: 1,
      admin: {
        description:
          'Set a position number next to each product to control the order they appear in the storefront when this category is browsed. Lower numbers appear first.',
        defaultColumns: ['product', 'position'],
        allowCreate: true,
      },
    },
  ],
}
