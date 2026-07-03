'use client'

import { Price } from '@/components/Price'
import { getOptionsForProductByType } from '@/lib/productVariants'
import type { Media, Product, VariantType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'

type VariantOptionWithColor = {
  id: number
  label: string
  value: string
  color?: string | null
}

type Props = {
  product: Partial<Product>
}

type PopulatedGalleryItem = {
  image: Media
  variantOption?: VariantOptionWithColor | null | number
  id?: string | null
}

function getPopulatedGallery(product: Partial<Product>): PopulatedGalleryItem[] {
  return (product.gallery ?? []).filter(
    (item) => typeof item.image === 'object' && item.image !== null,
  ) as PopulatedGalleryItem[]
}

function getPopulatedVariantTypes(product: Partial<Product>): VariantType[] {
  if (!product.enableVariants || !product.variantTypes) return []
  return (product.variantTypes as (number | VariantType)[]).filter(
    (vt): vt is VariantType => typeof vt === 'object' && vt !== null,
  )
}

/** Returns the first populated category title for the label above the product name */
function getCategoryLabel(product: Partial<Product>): string | null {
  const cats = product.categories
  if (!cats || !Array.isArray(cats) || cats.length === 0) return null
  const first = cats[0]
  if (typeof first === 'object' && first !== null && 'title' in first) {
    return (first as { title?: string | null }).title ?? null
  }
  return null
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { priceInEUR, compareAtPriceInEUR, title, inventory } = product

  const gallery = getPopulatedGallery(product)
  const variantTypes = getPopulatedVariantTypes(product)
  const categoryLabel = getCategoryLabel(product)

  // Map variantOptionId → gallery index so hovering a pill swaps the image
  const optionImageMap = new Map<number, number>()
  gallery.forEach((item, idx) => {
    if (item.variantOption && typeof item.variantOption === 'object') {
      optionImageMap.set((item.variantOption as VariantOptionWithColor).id, idx)
    }
  })

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)

  const findVariantByOptionId = useCallback((optionId: number) => {
    const docs = (product.variants as any)?.docs ?? []
    return docs.find((v: any) =>
      Array.isArray(v.options) &&
      v.options.some((opt: any) => (typeof opt === 'object' ? opt.id : opt) === optionId),
    )
  }, [product.variants])

  const variantDocs = useMemo(() => {
    const docs = (product.variants as any)?.docs ?? []
    return docs.filter((v: any) => typeof v === 'object' && typeof v.priceInEUR === 'number')
  }, [product.variants])

  const lowestVariantPrice = useMemo(() => {
    if (!variantDocs.length) return null
    const prices: number[] = variantDocs.map((v: any) => v.priceInEUR as number)
    return Math.min(...prices)
  }, [variantDocs])

  const lowestVariantCompareAt = useMemo(() => {
    if (!variantDocs.length) return null
    const comparePrices: number[] = variantDocs
      .map((v: any) => v.compareAtPriceInEUR as number)
      .filter((p: number) => typeof p === 'number' && p > 0)
    return comparePrices.length > 0 ? Math.min(...comparePrices) : null
  }, [variantDocs])

  const hasVariantPrices = variantDocs.length > 0

  const displayedPrice = useMemo(() => {
    if (selectedOptionId !== null) {
      const variant = findVariantByOptionId(selectedOptionId)
      if (variant && typeof variant.priceInEUR === 'number') return variant.priceInEUR
    }
    return priceInEUR
  }, [selectedOptionId, findVariantByOptionId, priceInEUR])

  const displayedCompareAt = useMemo(() => {
    if (selectedOptionId !== null) {
      const variant = findVariantByOptionId(selectedOptionId)
      if (variant && typeof variant.compareAtPriceInEUR === 'number' && variant.compareAtPriceInEUR > variant.priceInEUR) {
        return variant.compareAtPriceInEUR
      }
    }
    return compareAtPriceInEUR
  }, [selectedOptionId, findVariantByOptionId, compareAtPriceInEUR])

  const activeImageIndex =
    selectedOptionId !== null && optionImageMap.has(selectedOptionId)
      ? optionImageMap.get(selectedOptionId)!
      : 0

  const activeImage = gallery[activeImageIndex]?.image as Media | undefined
  const isOutOfStock = inventory == null || Number(inventory) <= 0

  const handlePillClick = useCallback((e: React.MouseEvent, optionId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedOptionId((prev) => (prev === optionId ? null : optionId))
  }, [])

  return (
    <div className="product-card group">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden bg-[rgba(226,219,208,0.35)]">
          {activeImage?.url ? (
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? title ?? ''}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[#E2DBD0]/40" />
          )}

          {/* Sale badge - shown when compareAtPrice > price */}
          {(() => {
            const isVariantOnSale = selectedOptionId !== null && displayedCompareAt && displayedPrice && displayedCompareAt > displayedPrice
            const isProductOnSale = !selectedOptionId && typeof compareAtPriceInEUR === 'number' && compareAtPriceInEUR > (priceInEUR ?? 0)
            const isOnSale = isVariantOnSale || isProductOnSale
            if (!isOnSale) return null
            const comparePrice = displayedCompareAt || compareAtPriceInEUR
            const salePrice = displayedPrice || priceInEUR
            const discount = comparePrice && salePrice ? Math.round(((comparePrice - salePrice) / comparePrice) * 100) : 0
            return (
              <span className="absolute left-3 top-3 bg-olive px-2.5 py-1 font-sans text-[10px] tracking-widest uppercase text-white">
                -{discount}%
              </span>
            )
          })()}

          {/* "New" or "Bestseller" badge — driven by product tags if available */}
          {isOutOfStock && (
            <span className="absolute right-3 top-3 bg-charcoal/80 px-2.5 py-1 font-sans text-[10px] tracking-widest uppercase text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Category label */}
        {categoryLabel && (
          <p className="mb-1 font-sans text-[10px] tracking-[0.25em] uppercase text-warm-gray">
            {categoryLabel}
          </p>
        )}

        {/* Product title */}
        <h3 className="mb-1 font-serif text-lg font-light text-charcoal transition-colors group-hover:text-olive">
          {title}
        </h3>
      </Link>

      {/* Variant pills — clicking doesn't navigate, just selects */}
      {variantTypes.length > 0 && (
        <div
          className="mb-2 flex flex-wrap gap-1"
          onClick={(e) => e.preventDefault()}
        >
          {variantTypes.map((vt) => {
            const opts = getOptionsForProductByType(product as Product, vt.id) as VariantOptionWithColor[]
            if (!opts.length) return null

            return opts.map((opt) => {
              const isSelected = selectedOptionId === opt.id
              const hasColor = Boolean(opt.color)

              if (hasColor && opt.color) {
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={(e) => handlePillClick(e, opt.id)}
                    title={opt.label}
                    className={cn(
                      'h-5 w-5 rounded-full transition-all duration-150',
                      isSelected
                        ? 'ring-2 ring-[#4A5E3A] ring-offset-1 scale-110'
                        : 'ring-1 ring-[#E2DBD0] hover:ring-[#4A5E3A] hover:scale-110',
                    )}
                    style={{ backgroundColor: opt.color }}
                    aria-label={opt.label}
                  />
                )
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => handlePillClick(e, opt.id)}
                  className={cn(
                    'border px-[0.55rem] py-[0.2rem] font-sans text-[11px] tracking-[0.06em] transition-all duration-150 leading-snug',
                    isSelected
                      ? 'border-olive bg-olive text-linen'
                      : 'border-warm-border text-warm-gray hover:border-olive hover:bg-olive hover:text-linen',
                  )}
                >
                  {opt.label}
                </button>
              )
            })
          })}
        </div>
      )}

      {/* Price */}
      {hasVariantPrices && selectedOptionId === null && lowestVariantPrice !== null ? (
        <Price
          as="p"
          lowestAmount={lowestVariantPrice}
          highestAmount={lowestVariantPrice + 1}
          showFrom
          currencyCode="EUR"
          className="mb-1 font-sans text-sm font-medium text-charcoal"
        />
      ) : typeof displayedPrice === 'number' ? (
        <Price
          as="p"
          amount={displayedPrice}
          compareAtAmount={displayedCompareAt ?? undefined}
          currencyCode="EUR"
          className="mb-1 font-sans text-sm font-medium text-charcoal"
        />
      ) : null}

      {/* Quick-add to cart button — links to product page with selected variant pre-filled */}
      <Link
        href={
          product.slug
            ? `/products/${product.slug}${selectedOptionId ? `?option=${selectedOptionId}` : ''}`
            : '#'
        }
        className={cn(
          'mt-3 block w-full border border-warm-border py-[0.55rem] text-center font-sans text-[11px] tracking-[0.12em] uppercase text-warm-gray transition-all duration-200',
          'hover:border-terra hover:bg-terra hover:text-linen',
          isOutOfStock && 'pointer-events-none opacity-40',
        )}
        aria-disabled={isOutOfStock}
        tabIndex={isOutOfStock ? -1 : undefined}
      >
        {isOutOfStock ? 'Sold Out' : '+ Add to Cart'}
      </Link>
    </div>
  )
}
