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
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white transition-all duration-300 hover:border-amber-300/60 hover:shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:hover:border-amber-700/40 dark:hover:shadow-amber-900/20"
      href={`/products/${product.slug}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
        {image ? (
          <Media
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            imgClassName="h-full w-full object-cover"
            resource={image}
            width={400}
            height={400}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40" />
        )}
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
        
        {/* Badge */}
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-neutral-800 shadow-md transition-all duration-300 group-hover:bg-white group-hover:shadow-lg dark:border-neutral-800/20 dark:bg-neutral-900/95 dark:text-neutral-100">
          Tile
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-neutral-900 transition-colors group-hover:text-amber-700 dark:text-neutral-50 dark:group-hover:text-amber-400">
            {title}
          </h3>
          
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1.5 text-xs text-neutral-500 dark:text-neutral-400">(5.0)</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
          {typeof price === 'number' && (
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              <Price amount={price} currencyCode="EUR" />
            </div>
          )}
          <div className="rounded-full bg-amber-100 p-2 transition-colors group-hover:bg-amber-200 dark:bg-amber-900/40 dark:group-hover:bg-amber-900/60">
            <svg className="h-4 w-4 text-amber-700 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
