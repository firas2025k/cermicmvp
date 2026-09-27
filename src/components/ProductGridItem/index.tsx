'use client'

import { PromoPrice } from '@/components/Price/PromoPrice'
import { getOptionsForProductByType } from '@/lib/productVariants'
import type { Media, Product, VariantType } from '@/payload-types'
import { useCartOpen } from '@/providers/CartOpen'
import { waitForStoredCartBinding } from '@/utilities/addToCart'
import { cn } from '@/utilities/cn'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

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
  const { addItem, cart } = useCart()
  const { openCart } = useCartOpen()
  const cartRef = useRef(cart)
  cartRef.current = cart
  const [isAdding, setIsAdding] = useState(false)

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

  const isOptionAvailable = useCallback(
    (optionId: number) => {
      const variant = findVariantByOptionId(optionId)
      if (!variant) return false
      return Number(variant.inventory ?? 0) > 0
    },
    [findVariantByOptionId],
  )

  const productPageHref = useMemo(() => {
    if (!product.slug) return '#'
    if (selectedOptionId == null) return `/products/${product.slug}`

    const params = new URLSearchParams()
    const primaryType = variantTypes[0]
    if (primaryType?.name) {
      params.set(primaryType.name, String(selectedOptionId))
    } else {
      params.set('option', String(selectedOptionId))
    }

    const variant = findVariantByOptionId(selectedOptionId)
    if (variant?.id != null) {
      params.set('variant', String(variant.id))
    }

    return `/products/${product.slug}?${params.toString()}`
  }, [product.slug, selectedOptionId, variantTypes, findVariantByOptionId])

  const variantDocs = useMemo(() => {
    const docs = (product.variants as any)?.docs ?? []
    return docs.filter((v: any) => typeof v === 'object' && typeof v.priceInEUR === 'number')
  }, [product.variants])

  const lowestVariantPrice = useMemo(() => {
    if (!variantDocs.length) return null
    const prices: number[] = variantDocs.map((v: any) => v.priceInEUR as number)
    return Math.min(...prices)
  }, [variantDocs])

  const highestVariantPrice = useMemo(() => {
    if (!variantDocs.length) return null
    const prices: number[] = variantDocs.map((v: any) => v.priceInEUR as number)
    return Math.max(...prices)
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

  const isOutOfStock = useMemo(() => {
    if (product.enableVariants) {
      const docs = ((product.variants as { docs?: unknown[] } | undefined)?.docs ?? []).filter(
        (v): v is { inventory?: number | null } => typeof v === 'object' && v !== null,
      )
      if (!docs.length) return true
      return docs.every((v) => Number(v.inventory ?? 0) <= 0)
    }
    return inventory == null || Number(inventory) <= 0
  }, [product.enableVariants, product.variants, inventory])

  const handlePillClick = useCallback((e: React.MouseEvent, optionId: number) => {
    e.preventDefault()
    e.stopPropagation()
    // Keep the same variant selected on repeat clicks so the price does not
    // jump back to the product default / "from" amount.
    setSelectedOptionId(optionId)
  }, [])

  const needsVariantSelection = Boolean(product.enableVariants && variantTypes.length > 0)
  const selectedVariant =
    selectedOptionId != null ? findVariantByOptionId(selectedOptionId) : undefined
  const selectedUnavailable =
    selectedOptionId != null && !isOptionAvailable(selectedOptionId)

  const handleQuickAdd = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (isAdding || isOutOfStock || !product.id) return

      if (needsVariantSelection && selectedOptionId == null) {
        toast.error('Bitte zuerst eine Variante wählen.')
        return
      }

      if (selectedUnavailable) return

      setIsAdding(true)
      try {
        await waitForStoredCartBinding(() => cartRef.current)

        await addItem(
          {
            product: product.id,
            variant: selectedVariant?.id,
          },
          1,
        )

        toast.success('Artikel wurde zum Warenkorb hinzugefügt.')
        openCart()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Artikel konnte nicht hinzugefügt werden.'
        console.error('[ProductGridItem] add failed', err)
        toast.error(message, { duration: 60_000 })
      } finally {
        setIsAdding(false)
      }
    },
    [
      addItem,
      isAdding,
      isOutOfStock,
      needsVariantSelection,
      openCart,
      product.id,
      selectedOptionId,
      selectedUnavailable,
      selectedVariant?.id,
    ],
  )

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
              Ausverkauft
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
              const available = isOptionAvailable(opt.id)

              if (hasColor && opt.color) {
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={(e) => handlePillClick(e, opt.id)}
                    title={`${opt.label}${!available ? ' (Nicht vorrätig)' : ''}`}
                    className={cn(
                      'h-5 w-5 rounded-full transition-all duration-150',
                      isSelected
                        ? 'ring-2 ring-[#4A5E3A] ring-offset-1 scale-110'
                        : 'ring-1 ring-[#E2DBD0] hover:ring-[#4A5E3A] hover:scale-110',
                      !available && 'opacity-30',
                    )}
                    style={{ backgroundColor: opt.color }}
                    aria-label={`${opt.label}${!available ? ' – Nicht vorrätig' : ''}`}
                  />
                )
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => handlePillClick(e, opt.id)}
                  title={`${opt.label}${!available ? ' (Nicht vorrätig)' : ''}`}
                  className={cn(
                    'border px-[0.55rem] py-[0.2rem] font-sans text-[11px] tracking-[0.06em] transition-all duration-150 leading-snug',
                    isSelected && available
                      ? 'border-olive bg-olive text-linen'
                      : isSelected && !available
                        ? 'border-warm-border bg-warm-border/30 text-warm-gray line-through'
                        : 'border-warm-border text-warm-gray hover:border-olive hover:bg-olive hover:text-linen',
                    !available && !isSelected && 'text-warm-border line-through',
                  )}
                >
                  {opt.label}
                </button>
              )
            })
          })}
        </div>
      )}

      {/* Price — "Ab …" only when variant prices actually differ */}
      {hasVariantPrices && selectedOptionId === null && lowestVariantPrice !== null ? (
        lowestVariantPrice !== highestVariantPrice ? (
          <PromoPrice
            as="p"
            lowestAmount={lowestVariantPrice}
            highestAmount={highestVariantPrice!}
            showFrom
            currencyCode="EUR"
            className="mb-1 font-sans text-sm font-medium text-charcoal"
          />
        ) : (
          <PromoPrice
            as="p"
            amount={lowestVariantPrice}
            currencyCode="EUR"
            className="mb-1 font-sans text-sm font-medium text-charcoal"
          />
        )
      ) : typeof displayedPrice === 'number' ? (
        <PromoPrice
          as="p"
          amount={displayedPrice}
          compareAtAmount={displayedCompareAt ?? undefined}
          currencyCode="EUR"
          className="mb-1 font-sans text-sm font-medium text-charcoal"
        />
      ) : null}

      {/* Quick-add — real cart add; image/title above still open the product page */}
      {selectedUnavailable ? (
        <Link
          href={productPageHref}
          className="mt-3 block w-full border border-warm-border py-[0.55rem] text-center font-sans text-[11px] tracking-[0.12em] uppercase text-warm-gray transition-all duration-200 hover:border-terra hover:bg-terra hover:text-linen"
        >
          Benachrichtigen
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isOutOfStock || isAdding}
          className={cn(
            'mt-3 block w-full border border-warm-border py-[0.55rem] text-center font-sans text-[11px] tracking-[0.12em] uppercase text-warm-gray transition-all duration-200',
            'hover:border-terra hover:bg-terra hover:text-linen',
            (isOutOfStock || isAdding) && 'pointer-events-none opacity-40',
          )}
        >
          {isOutOfStock ? 'Ausverkauft' : isAdding ? 'Wird hinzugefügt…' : '+ In den Warenkorb'}
        </button>
      )}
    </div>
  )
}
