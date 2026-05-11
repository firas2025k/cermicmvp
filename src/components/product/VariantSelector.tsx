'use client'

import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariantTypes = Boolean(product.enableVariants && variantTypes?.length)

  if (!hasVariantTypes) return null

  return (
    <div className="space-y-5">
      {(variantTypes ?? []).map((type) => {
        if (!type || typeof type !== 'object') return null
        const options = type.options?.docs
        if (!options || !Array.isArray(options) || !options.length) return null

        return (
          <div key={type.id}>
            {/* Label row: "SIZE  · L" */}
            <p className="mb-2.5 font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-charcoal">
              {type.label}
              {/* Show selected option label inline */}
              {(() => {
                const selectedId = searchParams.get(type.name)
                const selected = options.find(
                  (o) => typeof o === 'object' && String(o.id) === selectedId,
                )
                return selected && typeof selected === 'object' ? (
                  <span className="ml-1.5 font-normal normal-case tracking-normal text-warm-gray">
                    {selected.label}
                  </span>
                ) : null
              })()}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {options.map((option) => {
                if (!option || typeof option !== 'object') return null

                const optionID = option.id
                const optionKey = type.name
                const isColorSwatch = Boolean(option.color)

                const optionSearchParams = new URLSearchParams(searchParams.toString())
                optionSearchParams.delete('variant')
                optionSearchParams.delete('image')
                optionSearchParams.set(optionKey, String(optionID))

                const currentOptions = Array.from(optionSearchParams.values())
                let isAvailableForSale = true

                if (variants) {
                  const matchingVariant = variants
                    .filter((v): v is NonNullable<typeof v> & object => typeof v === 'object')
                    .find((v) => {
                      if (!v.options || !Array.isArray(v.options)) return false
                      return v.options.every((vo) => {
                        if (typeof vo !== 'object') return currentOptions.includes(String(vo))
                        return currentOptions.includes(String(vo.id))
                      })
                    })

                  if (matchingVariant) {
                    optionSearchParams.set('variant', String(matchingVariant.id))
                    isAvailableForSale = Boolean(
                      matchingVariant.inventory && matchingVariant.inventory > 0,
                    )
                  }
                }

                const optionUrl = createUrl(pathname, optionSearchParams)
                const isActive =
                  isAvailableForSale &&
                  searchParams.get(optionKey) === String(optionID)

                if (isColorSwatch && option.color) {
                  return (
                    <button
                      key={optionID}
                      type="button"
                      onClick={() => router.replace(optionUrl, { scroll: false })}
                      title={`${option.label}${!isAvailableForSale ? ' (Out of stock)' : ''}`}
                      aria-label={option.label}
                      aria-disabled={!isAvailableForSale}
                      disabled={!isAvailableForSale}
                      className={cn(
                        'h-8 w-8 flex-shrink-0 border-2 transition-all duration-150 outline-offset-2',
                        isActive
                          ? 'border-charcoal outline outline-2 outline-charcoal'
                          : 'border-transparent hover:border-warm-gray',
                        !isAvailableForSale && 'opacity-30 cursor-not-allowed',
                      )}
                      style={{ backgroundColor: option.color }}
                    />
                  )
                }

                return (
                  <button
                    key={optionID}
                    type="button"
                    onClick={() => router.replace(optionUrl, { scroll: false })}
                    title={`${option.label}${!isAvailableForSale ? ' (Out of stock)' : ''}`}
                    aria-disabled={!isAvailableForSale}
                    disabled={!isAvailableForSale}
                    className={cn(
                      'h-[38px] min-w-[52px] border px-3.5 font-sans text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'border-charcoal bg-charcoal text-linen'
                        : 'border-warm-border bg-linen text-charcoal hover:border-olive hover:text-olive',
                      !isAvailableForSale &&
                        'border-warm-border text-warm-border cursor-not-allowed line-through',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
