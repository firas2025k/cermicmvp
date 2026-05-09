import type { CollectionConfig } from 'payload'

/**
 * Stores an explicit display position for a product within a specific category.
 * Editors set these from the Category admin page (join field).
 * The storefront uses these positions to sort products when browsing that exact category.
 */
export const CategoryProductOrder: CollectionConfig = {
  slug: 'category-product-orders',
  admin: {
    useAsTitle: 'id',
    group: 'Content',
    description: 'Controls the display order of products within a category on the storefront.',
    defaultColumns: ['category', 'product', 'position'],
    hidden: true, // accessible via the Category join; no need in the sidebar
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      filterOptions: ({ data }) => ({
        _status: { equals: 'published' },
        ...(data?.category
          ? {
              categories: {
                contains: typeof data.category === 'object' ? data.category.id : data.category,
              },
            }
          : {}),
      }),
    },
    {
      name: 'position',
      type: 'number',
      required: true,
      defaultValue: 999,
      min: 0,
      admin: {
        description: 'Lower numbers appear first (1 = first, 2 = second…). Products with no entry here appear last, alphabetically.',
      },
    },
  ],
}
