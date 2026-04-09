import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Star } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInEUR, title, inventory } = product
  const isOutOfStock = inventory == null || Number(inventory) <= 0

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
      href={`/products/${product.slug}`}
      className="group flex h-full w-full flex-col bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-neutral-900"
    >
      <div className="relative aspect-square bg-white dark:bg-neutral-950">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-5 sm:p-7">
          {image ? (
            <Media
              className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              imgClassName="max-h-full max-w-full object-contain"
              resource={image}
              width={400}
              height={400}
            />
          ) : (
            <div className="h-full w-full rounded-md bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/30 dark:to-amber-900/20" />
          )}
        </div>

        {isOutOfStock ? (
          <>
            <span className="sr-only">Nicht vorrätig</span>
            <div
              className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] bg-neutral-500 px-3 py-2 text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-white shadow-sm dark:bg-neutral-600"
              aria-hidden
            >
              Nicht vorrätig
            </div>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-4 text-center">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-medium leading-snug text-neutral-900 transition-colors group-hover:text-amber-800 dark:text-neutral-100 dark:group-hover:text-amber-400">
          {title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">(5.0)</span>
        </div>

        {typeof price === 'number' ? (
          <div className="mt-3 text-lg font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
            <Price amount={price} currencyCode="EUR" />
          </div>
        ) : null}
      </div>
    </Link>
  )
}
