import type { CategoryBannerBlock as CategoryBannerBlockProps } from '@/payload-types'
import type { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'

export const CategoryBannerBlockComponent: React.FC<CategoryBannerBlockProps> = async (props) => {
  const {
    title,
    subtitle,
    categories,
    limit = 4,
    populateBy,
    selectedDocs,
    sort = '-createdAt',
    ctaText = 'Jetzt entdecken',
    ctaLink = '/shop',
  } = props

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

  return (
    <section className="border-b border-neutral-200 bg-gradient-to-br from-amber-50 via-neutral-50 to-stone-50 py-20 dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((product, index) => {
              const image =
                product.gallery?.[0]?.image && typeof product.gallery[0]?.image !== 'string'
                  ? product.gallery[0].image
                  : null

              return (
                <div
                  key={product.id || index}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg dark:from-amber-900/40 dark:to-amber-800/40"
                >
                  {image ? (
                    <Media
                      className="h-full w-full object-cover"
                      resource={image}
                      width={400}
                      height={400}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-neutral-900">
            <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="text-center text-lg text-neutral-600 dark:text-neutral-300">{subtitle}</p>
            )}
            <Link
              href={ctaLink || '/shop'}
              className="rounded-full bg-amber-800 px-8 py-3 text-base font-medium text-white shadow-lg transition hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

