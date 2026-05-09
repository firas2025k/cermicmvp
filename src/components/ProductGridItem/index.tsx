'use client'

import type { Media, Product, VariantType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { Price } from '@/components/Price'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useState } from 'react'

// Extend VariantOption with the color field we added via collection override
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

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { priceInEUR, title, inventory } = product

  const gallery = getPopulatedGallery(product)
  const variantTypes = getPopulatedVariantTypes(product)

  // Build a map: variantOptionId → gallery index
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

  const handleOptionClick = useCallback((e: React.MouseEvent, optionId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedOptionId((prev) => (prev === optionId ? null : optionId))
  }, [])

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        {activeImage?.url ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? title ?? ''}
            fill
            className="object-contain p-5 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-stone-100 dark:from-amber-950/20 dark:to-neutral-900" />
        )}

        {isOutOfStock && (
          <div className="absolute left-0 top-3">
            <span className="sr-only">Nicht vorrätig</span>
            <div
              aria-hidden
              className="rounded-r-full bg-neutral-700/90 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
            >
              Ausverkauft
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col items-center gap-3 p-4 text-center">
        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-amber-700 dark:text-neutral-100 dark:group-hover:text-amber-400">
          {title}
        </h3>

        {/* Variant rows — one row per variant type */}
        {variantTypes.length > 0 && (
          <div
            className="flex w-full flex-col items-center gap-2"
            onClick={(e) => e.preventDefault()}
          >
            {variantTypes.map((vt) => {
              const opts = (vt.options?.docs ?? []).filter(
                (opt): opt is VariantOptionWithColor =>
                  typeof opt === 'object' && opt !== null,
              )
              if (!opts.length) return null

              const isColorRow = opts.some((o) => Boolean(o.color))

              return (
                <div key={vt.id} className="flex flex-col items-center gap-1.5">
                  {/* Type label */}
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {vt.label}
                  </span>

                  {/* Options */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {opts.map((opt) => {
                      const isSelected = selectedOptionId === opt.id

                      if (isColorRow && opt.color) {
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={(e) => handleOptionClick(e, opt.id)}
                            title={opt.label}
                            className={cn(
                              'h-5 w-5 rounded-full transition-all duration-150',
                              isSelected
                                ? 'ring-2 ring-amber-500 ring-offset-1 scale-110'
                                : 'ring-1 ring-neutral-300 hover:ring-amber-400 hover:scale-110 dark:ring-neutral-600',
                            )}
                            style={{ backgroundColor: opt.color }}
                          />
                        )
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={(e) => handleOptionClick(e, opt.id)}
                          title={opt.label}
                          className={cn(
                            'rounded-md border px-2 py-0.5 text-[0.65rem] font-medium transition-all duration-150',
                            isSelected
                              ? 'border-amber-500 bg-amber-500 text-white'
                              : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-amber-400 hover:text-amber-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Price — pushed to bottom */}
        {typeof priceInEUR === 'number' && (
          <div className="mt-auto pt-1 text-center">
            <span className="text-base font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
              <Price amount={priceInEUR} currencyCode="EUR" />
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
