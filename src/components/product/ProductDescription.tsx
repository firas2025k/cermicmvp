'use client'
import type { Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  const searchParams = useSearchParams()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  
  // Use EUR as the primary currency (fallback if useCurrency doesn't return EUR)
  const currencyCode = currency?.code || 'EUR'
  const priceField = `priceIn${currencyCode}` as keyof Product
  const hasVariantTypes = product.enableVariants && Boolean(product.variantTypes?.length)
  const hasVariantPrices = product.enableVariants && Boolean(product.variants?.docs?.length)
  const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }
    return null
  }
  const selectedVariantID = searchParams.get('variant')

  if (hasVariantPrices) {
    const selectedVariant = product.variants?.docs?.find((variant) => {
      if (!variant || typeof variant !== 'object') return false
      return String(variant.id) === selectedVariantID
    })

    if (selectedVariant && typeof selectedVariant === 'object') {
      const selectedVariantPrice = toNumber(selectedVariant.priceInEUR)
      if (selectedVariantPrice && selectedVariantPrice > 0) {
        amount = selectedVariantPrice
      }
    }

    const variantPriceField = `priceIn${currencyCode}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (typeof a !== 'object' || typeof b !== 'object') return 0
        const aPrice = toNumber(a[variantPriceField])
        const bPrice = toNumber(b[variantPriceField])
        if (aPrice === null || bPrice === null) return 0
        return aPrice - bPrice
      }) as Variant[]

    const lowestVariant = toNumber(variantsOrderedByPrice[0]?.[variantPriceField])
    const highestVariant = toNumber(
      variantsOrderedByPrice[variantsOrderedByPrice.length - 1]?.[variantPriceField],
    )
    if (
      variantsOrderedByPrice &&
      variantsOrderedByPrice.length > 0 &&
      lowestVariant !== null &&
      highestVariant !== null
    ) {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }

    if (amount === 0) {
      const basePrice = toNumber(product.priceInEUR)
      if (basePrice && basePrice > 0) {
        amount = basePrice
      }
    }
  } else {
    // For non-variant products, check priceInEUR directly (with fallback)
    const eurPrice = toNumber(product.priceInEUR)
    const usdPrice = toNumber(product.priceInUSD)
    const dynamicPrice = toNumber(product[priceField])
    
    if (eurPrice !== null && eurPrice > 0) {
      amount = eurPrice
    } else if (usdPrice !== null && usdPrice > 0) {
      amount = usdPrice
    } else if (dynamicPrice !== null && dynamicPrice > 0) {
      amount = dynamicPrice
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-3xl">
          {product.title}
        </h1>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {amount > 0 ? (
              <Price amount={amount} currencyCode="EUR" />
            ) : hasVariantPrices && (lowestAmount > 0 || highestAmount > 0) ? (
              <Price highestAmount={highestAmount} lowestAmount={lowestAmount} currencyCode="EUR" />
            ) : (
              <Price amount={0} currencyCode="EUR" />
            )}
          </div>
        </div>
      </div>

      {product.description ? (
        <RichText
          className="prose prose-sm max-w-none text-neutral-600 dark:prose-invert dark:text-neutral-300"
          data={product.description}
          enableGutter={false}
        />
      ) : null}

      {hasVariantTypes && (
        <div className="space-y-3">
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
