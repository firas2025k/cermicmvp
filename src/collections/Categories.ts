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
  ],
}
