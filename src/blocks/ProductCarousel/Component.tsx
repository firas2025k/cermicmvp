import type { Product, ProductCarouselBlock as ProductCarouselBlockProps } from '@/payload-types'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { ProductCarousel } from '@/components/ProductCarousel'
import { getCategoryAndDescendantIds, organizeCategories } from '@/lib/categories'

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchProducts(props: ProductCarouselBlockProps): Promise<Product[]> {
  const { categories, limit = 8, populateBy, selectedDocs, sort = '-createdAt' } = props

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

    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'title',
      depth: 1,
    })
    const allCategories = categoriesResult.docs || []
    const { byParent } = organizeCategories(allCategories)

    const categoryIdsToMatch: (number | string)[] = []
    for (const id of flattenedCategories) {
      categoryIdsToMatch.push(...getCategoryAndDescendantIds(id, byParent))
    }
    const uniqueCategoryIds = [...new Set(categoryIdsToMatch)]

    const result = await payload.find({
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
        compareAtPriceInEUR: true,
        categories: true,
        enableVariants: true,
      },
      populate: {
        variants: {
          title: true,
          priceInEUR: true,
          compareAtPriceInEUR: true,
          inventory: true,
        },
      },
      ...(uniqueCategoryIds.length > 0
        ? {
            where: {
              or: uniqueCategoryIds.map((id) => ({
                categories: { contains: id },
              })),
            },
          }
        : {}),
    })

    return await applyDiscountsToProducts(result.docs as Product[], payload)
  }

  if (selectedDocs?.length) {
    let products = selectedDocs
      .map((doc) => {
        if (typeof doc !== 'object' || !doc) return null
        const val = doc.value
        if (typeof val === 'object' && val !== null && 'slug' in val) return val as Product
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
          select: {
            id: true,
            title: true,
            slug: true,
            gallery: true,
            priceInEUR: true,
            compareAtPriceInEUR: true,
            categories: true,
            enableVariants: true,
          },
          populate: {
            variants: {
              title: true,
              priceInEUR: true,
              compareAtPriceInEUR: true,
              inventory: true,
            },
          },
        })
        // Restore the admin-selected order
        const byId = new Map(found.docs.map((p) => [p.id, p]))
        const orderedProducts = ids.map((id) => byId.get(id)).filter((p): p is Product => p != null)
        products = await applyDiscountsToProducts(orderedProducts, payload)
      }
    }

    return products
  }

  return []
}

// ── Block component ───────────────────────────────────────────────────────────

export const ProductCarouselBlockComponent: React.FC<ProductCarouselBlockProps> = async (props) => {
  const { title, limit = 8 } = props
  const products = await fetchProducts(props)

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Section header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-warm-gray mb-3">
              Handpicked
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light text-charcoal">
              {title || 'Featured Pieces'}
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden md:inline-flex items-center px-6 py-2.5 font-sans text-sm tracking-wide border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200 rounded-none"
          >
            View All
          </Link>
        </div>

        {/* Carousel or empty state */}
        {products.length === 0 ? (
          <p className="font-sans text-sm text-warm-gray">
            No products to display. Add products in the admin or adjust this block&apos;s
            configuration.
          </p>
        ) : (
          <ProductCarousel products={products} limit={limit || 8} />
        )}

      </div>
    </section>
  )
}
