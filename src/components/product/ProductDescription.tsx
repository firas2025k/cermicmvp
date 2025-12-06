'use client'
import type { Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  
  // Use EUR as the primary currency (fallback if useCurrency doesn't return EUR)
  const currencyCode = currency?.code || 'EUR'
  const priceField = `priceIn${currencyCode}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const variantPriceField = `priceIn${currencyCode}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          variantPriceField in a &&
          variantPriceField in b &&
          typeof a[variantPriceField] === 'number' &&
          typeof b[variantPriceField] === 'number'
        ) {
          return a[variantPriceField] - b[variantPriceField]
        }

        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0]?.[variantPriceField]
    const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1]?.[variantPriceField]
    if (
      variantsOrderedByPrice &&
      variantsOrderedByPrice.length > 0 &&
      typeof lowestVariant === 'number' &&
      typeof highestVariant === 'number'
    ) {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else {
    // For non-variant products, check priceInEUR directly (with fallback)
    const eurPrice = product.priceInEUR
    const usdPrice = product.priceInUSD
    
    if (typeof eurPrice === 'number' && eurPrice > 0) {
      amount = eurPrice
    } else if (typeof usdPrice === 'number' && usdPrice > 0) {
      amount = usdPrice
    } else if (product[priceField] && typeof product[priceField] === 'number') {
      amount = product[priceField] as number
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
          Tile
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-3xl">
          {product.title}
        </h1>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {hasVariants ? (
              <Price highestAmount={highestAmount} lowestAmount={lowestAmount} currencyCode="EUR" />
            ) : (
              <Price amount={amount} currencyCode="EUR" />
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Pricing example – typically per box. You can adjust exact units later.
          </p>
        </div>
      </div>

      {product.description ? (
        <RichText
          className="prose prose-sm max-w-none text-neutral-600 dark:prose-invert dark:text-neutral-300"
          data={product.description}
          enableGutter={false}
        />
      ) : null}

      {hasVariants && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600 dark:text-neutral-300">
            Color / style
          </p>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
