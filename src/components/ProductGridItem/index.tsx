'use client'

import type { Media, Product, VariantType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useState } from 'react'

type VariantOptionWithColor = {
  id: number
  label: string
  value: string
  color?: string | null
}

type Props = {
  product: Partial<Product>
}

function getPopulatedGallery(product: Partial<Product>) {
  return (product.gallery ?? []).filter(
    (item): item is {
      image: Media
      variantOption?: VariantOptionWithColor | null | number
      id?: string | null
    } => typeof item.image === 'object' && item.image !== null,
  )
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
  const { priceInEUR, title, inventory } = product

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

          {/* "New" or "Bestseller" badge — driven by product tags if available */}
          {isOutOfStock && (
            <span className="absolute left-3 top-3 bg-charcoal/80 px-2.5 py-1 font-sans text-[10px] tracking-widest uppercase text-white">
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
            const opts = (vt.options?.docs ?? []).filter(
              (opt): opt is VariantOptionWithColor =>
                typeof opt === 'object' && opt !== null,
            )
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
      {typeof priceInEUR === 'number' && (
        <p className="mb-1 font-sans text-sm font-medium text-charcoal">
          € {priceInEUR.toFixed(2).replace('.', ',')}
        </p>
      )}

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
