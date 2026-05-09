'use client'

import type { Media, Product, VariantOption, VariantType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useCallback } from 'react'
import { Price } from '@/components/Price'

type Props = {
  product: Partial<Product>
}

/**
 * Extracts populated gallery items (where image is a Media object, not just an ID).
 */
function getPopulatedGallery(product: Partial<Product>) {
  return (product.gallery ?? []).filter(
    (item): item is { image: Media; variantOption?: VariantOption | null | number; id?: string | null } =>
      typeof item.image === 'object' && item.image !== null,
  )
}

/**
 * Extracts populated variant types with their option lists.
 */
function getPopulatedVariantTypes(product: Partial<Product>): VariantType[] {
  if (!product.enableVariants || !product.variantTypes) return []
  return (product.variantTypes as (number | VariantType)[]).filter(
    (vt): vt is VariantType => typeof vt === 'object' && vt !== null,
  )
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { priceInEUR, title, inventory } = product

  const gallery = getPopulatedGallery(product)
  const variantTypes = getPopulatedVariantTypes(product)

  // Gather all selectable options across all variant types (flat list for the card)
  const allOptions: VariantOption[] = variantTypes.flatMap((vt) => {
    const docs = vt.options?.docs ?? []
    return docs.filter((opt): opt is VariantOption => typeof opt === 'object' && opt !== null)
  })

  const hasVariantOptions = allOptions.length > 0

  // Build a map: variantOptionId → gallery index for quick image lookup
  const optionImageMap = new Map<number, number>()
  gallery.forEach((item, idx) => {
    if (item.variantOption && typeof item.variantOption === 'object') {
      optionImageMap.set((item.variantOption as VariantOption).id, idx)
    }
  })

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)

  // Resolve which gallery item to display
  const activeImageIndex =
    selectedOptionId !== null && optionImageMap.has(selectedOptionId)
      ? optionImageMap.get(selectedOptionId)!
      : 0

  const activeImage = gallery[activeImageIndex]?.image as Media | undefined

  const isOutOfStock = inventory == null || Number(inventory) <= 0

  const handleOptionClick = useCallback(
    (e: React.MouseEvent, optionId: number) => {
      // Prevent navigating to product page when clicking a variant pill
      e.preventDefault()
      e.stopPropagation()
      setSelectedOptionId((prev) => (prev === optionId ? null : optionId))
    },
    [],
  )

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full w-full flex-col bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-neutral-900"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-white dark:bg-neutral-950">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-5 sm:p-7">
          {activeImage?.url ? (
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? title ?? ''}
              width={400}
              height={400}
              className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full rounded-md bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/30 dark:to-amber-900/20" />
          )}
        </div>

        {isOutOfStock && (
          <>
            <span className="sr-only">Nicht vorrätig</span>
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] bg-neutral-500 px-3 py-2 text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-white shadow-sm dark:bg-neutral-600"
            >
              Nicht vorrätig
            </div>
          </>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-4 text-center">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-medium leading-snug text-neutral-900 transition-colors group-hover:text-amber-800 dark:text-neutral-100 dark:group-hover:text-amber-400">
          {title}
        </h3>

        {/* Variant option pills */}
        {hasVariantOptions && (
          <div
            className="mt-3 flex flex-wrap items-center justify-center gap-1.5"
            onClick={(e) => e.preventDefault()}
          >
            {allOptions.map((opt) => {
              const isSelected = selectedOptionId === opt.id
              const hasImage = optionImageMap.has(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => handleOptionClick(e, opt.id)}
                  title={opt.label}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium transition-all',
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                      : hasImage
                        ? 'border-neutral-300 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-400',
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}

        {typeof priceInEUR === 'number' && (
          <div className="mt-3 text-lg font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
            <Price amount={priceInEUR} currencyCode="EUR" />
          </div>
        )}
      </div>
    </Link>
  )
}
