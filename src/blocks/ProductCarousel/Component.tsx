import type { ProductCarouselBlock as ProductCarouselBlockProps } from '@/payload-types'
import type { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ProductCarousel } from '@/components/ProductCarousel'

export const ProductCarouselBlockComponent: React.FC<ProductCarouselBlockProps> = async (props) => {
  const { title, categories, limit = 8, populateBy, selectedDocs, sort = '-createdAt' } = props

  let products: Product[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = (categories ?? [])
      .map((category) => {
        if (category == null) return null
        if (typeof category === 'number') return category
        if (typeof category === 'object') {
          if ('id' in category && category.id != null) return category.id as number
          if ('value' in category) {
            const v = (category as { value?: unknown }).value
            if (typeof v === 'number') return v
            if (v && typeof v === 'object' && 'id' in v) return (v as { id: number }).id
          }
        }
        return null
      })
      .filter((id): id is number => id != null)

    const fetchedProducts = await payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      depth: 2,
      limit: limit || 100,
      sort: sort || '-createdAt',
      select: {
        id: true,
        title: true,
        slug: true,
        gallery: true,
        priceInEUR: true,
        categories: true,
        enableVariants: true,
      },
      populate: {
        variants: {
          title: true,
          priceInEUR: true,
          inventory: true,
        },
      },
      ...(flattenedCategories.length > 0
        ? {
            where: {
              or: flattenedCategories.map((id) => ({
                categories: { contains: id },
              })),
            },
          }
        : {}),
    })

    products = fetchedProducts.docs as Product[]
  } else if (selectedDocs?.length) {
    products = selectedDocs
      .map((doc) => {
        if (typeof doc !== 'object' || !doc) return null
        const val = doc.value
        if (typeof val === 'object' && val !== null && 'slug' in val) {
          return val as Product
        }
        if (typeof val === 'number') {
          return null
        }
        return null
      })
      .filter((p): p is Product => p !== null)

    if (products.length === 0 && selectedDocs.some((d) => typeof d?.value === 'number')) {
      const ids = selectedDocs
        .map((d) => (typeof d?.value === 'number' ? d.value : null))
        .filter((id): id is number => id != null)
      if (ids.length > 0) {
        const payload = await getPayload({ config: configPromise })
        const found = await payload.find({
          collection: 'products',
          draft: false,
          overrideAccess: false,
          depth: 2,
          where: { id: { in: ids } },
          limit: ids.length,
        })
        products = found.docs as Product[]
      }
    }
  }

  if (!products?.length) {
    return (
      <section className="border-b border-neutral-200 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {title}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No products to display. Add products in the admin or adjust this block&apos;s configuration.
          </p>
        </div>
      </section>
    )
  }

  return <ProductCarousel products={products} title={title} limit={limit || 8} />
}

