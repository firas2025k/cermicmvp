'use client'

import type { Media as MediaType, ProductUsageBlock as ProductUsageBlockProps } from '@/payload-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

type UsageItem = NonNullable<ProductUsageBlockProps['items']>[number]

function getItemHref(item: UsageItem): string {
  if (item.linkType === 'product' && item.product) {
    const product = typeof item.product === 'object' ? item.product : null
    if (product && 'slug' in product && product.slug) {
      return `/products/${product.slug}`
    }
  }
  return item.link || '/shop'
}

export function ProductUsageTile({ item }: { item: UsageItem }) {
  const image = typeof item.image === 'object' ? (item.image as MediaType) : null
  const href = getItemHref(item)

  return (
    <Link
      href={href}
      className="relative block aspect-[4/5] overflow-hidden bg-[#F7F3EE] group"
    >
      {image?.url ? (
        <div className="absolute inset-6 md:inset-8 lg:inset-10">
          <Image
            src={image.url}
            alt={image.alt || item.title}
            fill
            className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 33vw"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#E2DBD0]" />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(44,42,39,0.62) 0%, transparent 55%)',
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-8 text-[#F8F4EE]">
        {item.description && (
          <p className="font-sans text-[0.6rem] font-bold tracking-[0.22em] uppercase mb-2 opacity-75">
            {item.description}
          </p>
        )}
        <h3
          className="font-sans font-extrabold leading-[1.1] mb-4"
          style={{
            fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)',
            letterSpacing: '-0.02em',
          }}
        >
          {item.title}
        </h3>
        {item.linkText && (
          <span className="font-sans text-[0.65rem] font-bold tracking-[0.14em] uppercase underline underline-offset-[3px] text-[#F8F4EE] opacity-90 group-hover:opacity-100 transition-opacity duration-200">
            {item.linkText} →
          </span>
        )}
      </div>
    </Link>
  )
}

export function ProductUsageCarousel({ items }: { items: UsageItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const syncScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    syncScrollState()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', syncScrollState, { passive: true })
    window.addEventListener('resize', syncScrollState)
    return () => {
      el.removeEventListener('scroll', syncScrollState)
      window.removeEventListener('resize', syncScrollState)
    }
  }, [items.length, syncScrollState])

  const scrollByDir = useCallback((dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-usage-slide]')
    const amount = card ? card.offsetWidth : el.clientWidth / 3
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }, [])

  return (
    <div className="relative" aria-label="Unsere Vielfalt">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto"
        style={
          {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties
        }
      >
        {items.map((item, index) => (
          <div
            key={item.id ?? index}
            data-usage-slide
            className="w-[85%] shrink-0 snap-start sm:w-[50%] lg:w-[33.333%]"
          >
            <ProductUsageTile item={item} />
          </div>
        ))}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          aria-label="Vorherige"
          onClick={() => scrollByDir('left')}
          className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-warm-border bg-linen/95 text-charcoal shadow-sm transition hover:bg-linen md:flex"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Nächste"
          onClick={() => scrollByDir('right')}
          className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-warm-border bg-linen/95 text-charcoal shadow-sm transition hover:bg-linen md:flex"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  )
}
