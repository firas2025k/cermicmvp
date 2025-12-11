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

    const flattenedCategories = categories?.length
      ? categories.map((category) => {
          if (typeof category === 'object') return category.id
          else return category
        })
      : null

    const fetchedProducts = await payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      depth: 2,
      limit: limit || undefined,
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
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                contains: flattenedCategories[0],
              },
            },
          }
        : {}),
    })

    products = fetchedProducts.docs as Product[]
  } else if (selectedDocs?.length) {
    products = selectedDocs
      .map((doc) => {
        if (typeof doc === 'object' && doc.value && typeof doc.value !== 'string') {
          return doc.value as Product
        }
        return null
      })
      .filter((p): p is Product => p !== null)
  }

  if (!products?.length) return null

  return <ProductCarousel products={products} title={title} limit={limit || 8} />
}

