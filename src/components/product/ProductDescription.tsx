'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { RichText } from '@/components/RichText'
import type { Product, Variant } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import { NotifyMeForm } from './NotifyMeForm'

import { StockIndicator } from './StockIndicator'
import { VariantSelector } from './VariantSelector'
import { STATIC_CARE_AND_SHIPPING, type AccordionItem } from './staticFaq'

// ── Helpers ──────────────────────────────────────────────────────────────────

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string' && v.trim() !== '') {
    const p = Number(v)
    return Number.isFinite(p) ? p : null
  }
  return null
}

// ── Accordion item ────────────────────────────────────────────────────────────

function Accordion({ item, defaultOpen = false }: { item: AccordionItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn('border-t border-warm-border', open && 'open')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-olive"
      >
        <span className="font-sans text-xs font-bold tracking-[0.08em] uppercase text-charcoal">
          {item.title}
        </span>
        <svg
          className={cn(
            'h-4 w-4 flex-shrink-0 text-warm-gray transition-transform duration-250',
            open && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 font-sans text-sm leading-relaxed text-warm-gray">{item.body}</div>
      )}
    </div>
  )
}

// ── Trust bullets ─────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    label: 'Free shipping on orders over € 50',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    ),
  },
  {
    label: '30-day hassle-free returns',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    ),
  },
  {
    label: 'Secure SSL checkout',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
  },
  {
    label: 'Ships within 1–2 business days from Vienna',
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </>
    ),
  },
]

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  product: Product
  categoryLabel?: string | null
}

export function ProductDescription({ product, categoryLabel }: Props) {
  const { currency } = useCurrency()
  const searchParams = useSearchParams()

  const currencyCode = currency?.code || 'EUR'
  const priceField = `priceIn${currencyCode}` as keyof Product
  const hasVariantTypes = product.enableVariants && Boolean(product.variantTypes?.length)
  const hasVariantPrices = product.enableVariants && Boolean(product.variants?.docs?.length)

  const selectedVariantID = searchParams.get('variant')

  // ── Compute displayed price ──────────────────────────────────────────
  let amount = 0
  let lowestAmount = 0
  let highestAmount = 0

  const selectedVariant = hasVariantPrices
    ? product.variants?.docs?.find((v) => {
        if (typeof v !== 'object') return false
        return String(v.id) === selectedVariantID
      }) as Variant | undefined
    : undefined

  if (hasVariantPrices) {
    if (selectedVariant) {
      const selectedVariantPrice = toNumber(selectedVariant.priceInEUR)
      if (selectedVariantPrice !== null && selectedVariantPrice > 0) {
        amount = selectedVariantPrice
      } else {
        const basePrice = toNumber(product.priceInEUR)
        amount = basePrice !== null && basePrice > 0 ? basePrice : 0
      }
    } else {
      // Show range from lowest to highest variant price
      const variantPrices = (product.variants?.docs ?? [])
        .map((v) => (typeof v === 'object' ? toNumber(v.priceInEUR) : null))
        .filter((p): p is number => p !== null && p > 0)
      if (variantPrices.length) {
        lowestAmount = Math.min(...variantPrices)
        highestAmount = Math.max(...variantPrices)
        amount = lowestAmount
      }
    }
  } else {
    const eurPrice = toNumber(product.priceInEUR)
    const dynamicPrice = toNumber(product[priceField])
    if (eurPrice !== null && eurPrice > 0) {
      amount = eurPrice
    } else if (dynamicPrice !== null && dynamicPrice > 0) {
      amount = dynamicPrice
    }
  }

  // Price display — use Price component so cents→euros conversion is handled correctly

  // ── Compare-at price (sale) calculation ────────────────────────────
  let compareAtAmount: number | null = null

  if (hasVariantPrices && selectedVariant) {
    const variantCompareAt = toNumber(selectedVariant.compareAtPriceInEUR)
    if (variantCompareAt !== null && variantCompareAt > amount) {
      compareAtAmount = variantCompareAt
    }
  } else if (!hasVariantPrices) {
    const productCompareAt = toNumber(product.compareAtPriceInEUR)
    if (productCompareAt !== null && productCompareAt > amount) {
      compareAtAmount = productCompareAt
    }
  }

  // ── Out of stock detection ─────────────────────────────────────────
  const isOutOfStock = useMemo(() => {
    if (product.enableVariants) {
      if (!selectedVariantID) return false
      const v = product.variants?.docs?.find(
        (d) => typeof d === 'object' && String(d.id) === selectedVariantID,
      ) as Variant | undefined
      if (!v) return false
      return (v.inventory ?? 0) === 0
    }
    return (product.inventory ?? 0) === 0
  }, [product, selectedVariantID])

  const selectedVariantTitle = useMemo(() => {
    if (!selectedVariantID || !product.enableVariants) return null
    const v = product.variants?.docs?.find(
      (d) => typeof d === 'object' && String(d.id) === selectedVariantID,
    ) as Variant | undefined
    return v?.title ?? null
  }, [product, selectedVariantID])

  // ── Accordion items ─────────────────────────────────────────────────
  // Use CMS faqItems when set, otherwise fall back to static defaults
  const extraAccordionItems: AccordionItem[] =
    product.faqItems && product.faqItems.length > 0
      ? product.faqItems
          .filter((item) => item.question && item.answer)
          .map((item) => ({ title: item.question!, body: item.answer! }))
      : STATIC_CARE_AND_SHIPPING

  return (
    <div className="flex flex-col gap-0">
      {/* Brand / category label */}
      {categoryLabel && (
        <p className="mb-2 font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-warm-gray">
          {categoryLabel} · Nabea
        </p>
      )}

      {/* Product title */}
      <h1 className="mb-4 font-serif text-[clamp(1.9rem,2.8vw,2.8rem)] font-light leading-[1.1] tracking-[-0.01em] text-charcoal">
        {product.title}
      </h1>

      {/* Price */}
      {(amount > 0 || (lowestAmount > 0 && highestAmount > 0)) && (
        hasVariantPrices && !selectedVariantID && lowestAmount > 0 ? (
          <Price
            as="p"
            lowestAmount={lowestAmount}
            highestAmount={highestAmount}
            showFrom
            currencyCode="EUR"
            className="font-serif text-3xl font-normal text-charcoal"
          />
        ) : amount > 0 ? (
          <Price
            as="p"
            amount={amount}
            compareAtAmount={compareAtAmount ?? undefined}
            currencyCode="EUR"
            className="font-serif text-3xl font-normal text-charcoal"
          />
        ) : null
      )}
      <p className="mb-5 mt-1 font-sans text-xs text-warm-gray">inkl. MwSt</p>

      <hr className="border-warm-border" />

      {/* Variant selector */}
      {hasVariantTypes && (
        <div className="mt-5 mb-5">
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        </div>
      )}

      <hr className="border-warm-border mb-5" />

      {/* QTY + Add to Cart / Notify Me */}
      {isOutOfStock ? (
        <NotifyMeForm
          productId={product.id}
          productTitle={product.title || ''}
          variantId={selectedVariantID ? Number(selectedVariantID) : null}
          variantTitle={selectedVariantTitle}
        />
      ) : (
        <div className="mb-4 flex items-stretch gap-2.5">
          <Suspense fallback={null}>
            <AddToCart product={product} />
          </Suspense>
        </div>
      )}

      {/* Stock indicator */}
      <div className="mb-5">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      {/* Trust bullets — use CMS data if set, otherwise fall back to static defaults */}
      <div className="mb-5 flex flex-col gap-2.5">
        {product.trustBullets && product.trustBullets.length > 0
          ? product.trustBullets.map((item) => (
              <div key={item.id ?? item.label} className="flex items-center gap-2.5">
                <svg
                  className="h-4 w-4 flex-shrink-0 text-olive"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-sans text-sm text-warm-gray">{item.label}</span>
              </div>
            ))
          : TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <svg
                  className="h-4 w-4 flex-shrink-0 text-olive"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  {item.icon}
                </svg>
                <span className="font-sans text-sm text-warm-gray">{item.label}</span>
              </div>
            ))}
      </div>

      {/* Accordions */}
      <div className="border-b border-warm-border">
        {/* Description — from CMS if present */}
        {product.description ? (
          <div className="border-t border-warm-border">
            <DescriptionAccordion product={product} />
          </div>
        ) : null}

        {/* Static care, shipping & FAQ panels */}
        {extraAccordionItems.map((item, i) => (
          <Accordion key={item.title} item={item} defaultOpen={i === 0 && !product.description} />
        ))}
      </div>
    </div>
  )
}

// ── Description accordion (needs RichText, keeps CMS content as-is) ──────────

function DescriptionAccordion({ product }: { product: Product }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-olive"
      >
        <span className="font-sans text-xs font-bold tracking-[0.08em] uppercase text-charcoal">
          Description
        </span>
        <svg
          className={cn(
            'h-4 w-4 flex-shrink-0 text-warm-gray transition-transform duration-250',
            open && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4">
          <RichText
            className="prose prose-sm max-w-none font-sans text-warm-gray"
            data={product.description!}
            enableGutter={false}
          />
        </div>
      )}
    </div>
  )
}
