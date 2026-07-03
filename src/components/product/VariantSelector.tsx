'use client'

import {
    findMatchingProductVariant,
    getOptionsForProductByType,
    getPopulatedProductVariants,
    getSelectedVariantOptionIds,
} from '@/lib/productVariants'
import type { Product, VariantType } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const productVariants = getPopulatedProductVariants(product)
  const variantTypes = product.variantTypes ?? []
  const hasVariantTypes = Boolean(product.enableVariants && variantTypes.length)

  if (!hasVariantTypes) return null

  return (
    <div className="space-y-5">
      {(variantTypes ?? []).map((type) => {
        if (!type || typeof type !== 'object') return null

        const variantType = type as VariantType
        const options = getOptionsForProductByType(product, variantType.id)
        if (!options.length) return null

        return (
          <div key={variantType.id}>
            <p className="mb-2.5 font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-charcoal">
              {variantType.label}
              {(() => {
                const selectedId = searchParams.get(variantType.name)
                const selected = options.find((o) => String(o.id) === selectedId)
                return selected ? (
                  <span className="ml-1.5 font-normal normal-case tracking-normal text-warm-gray">
                    {selected.label}
                  </span>
                ) : null
              })()}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {options.map((option) => {
                const optionID = option.id
                const optionKey = variantType.name
                const isColorSwatch = Boolean(option.color)

                const optionSearchParams = new URLSearchParams(searchParams.toString())
                optionSearchParams.delete('variant')
                optionSearchParams.delete('image')
                optionSearchParams.set(optionKey, String(optionID))

                const nextSelection = getSelectedVariantOptionIds(
                  optionSearchParams,
                  variantTypes,
                )
                const matchingVariant = findMatchingProductVariant(
                  productVariants,
                  nextSelection,
                )

                let isAvailableForSale = false
                if (matchingVariant) {
                  optionSearchParams.set('variant', String(matchingVariant.id))
                  isAvailableForSale = Boolean(
                    matchingVariant.inventory && matchingVariant.inventory > 0,
                  )
                }

                const optionUrl = createUrl(pathname, optionSearchParams)
                const isActive =
                  isAvailableForSale && searchParams.get(optionKey) === String(optionID)

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
                        !isAvailableForSale && 'cursor-not-allowed opacity-30',
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
                        'cursor-not-allowed border-warm-border text-warm-border line-through',
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
