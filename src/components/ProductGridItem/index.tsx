import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'
import { Star } from 'lucide-react'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInEUR, title } = product

  let price = priceInEUR

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInEUR &&
      typeof variant.priceInEUR === 'number'
    ) {
      price = variant.priceInEUR
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  return (
    <Link
      className="group relative flex h-full w-full flex-col"
      href={`/products/${product.slug}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
        {image ? (
          <Media
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            imgClassName="h-full w-full object-cover"
            resource={image}
            width={400}
            height={400}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40" />
        )}
        {/* Logo badge */}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-neutral-800 shadow-sm dark:bg-neutral-900/90 dark:text-neutral-100">
          Tile
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-50">{title}</h3>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          {typeof price === 'number' && (
            <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              <Price amount={price} currencyCode="EUR" />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
