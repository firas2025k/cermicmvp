'use client'

import type { Product } from '@/payload-types'
import { ProductGridItem } from '@/components/ProductGridItem'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  products: Partial<Product>[]
  limit?: number
}

const AUTO_SCROLL_INTERVAL = 3500 // ms between auto-advances

export const ProductCarousel: React.FC<Props> = ({ products, limit = 8 }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const displayed = products.slice(0, limit)

  // ── Scroll state sync ──────────────────────────────────────────────────────
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
  }, [displayed.length, syncScrollState])

  // ── Manual scroll ──────────────────────────────────────────────────────────
  const scrollBy = useCallback((dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    // Advance by one card width + gap (approx clientWidth / visible cards)
    const cardWidth = el.clientWidth / (window.innerWidth >= 1024 ? 4 : 2)
    el.scrollBy({ left: dir === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' })
  }, [])

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  const advanceAuto = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4
    if (atEnd) {
      // Glide back to start
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      const cardWidth = el.clientWidth / (window.innerWidth >= 1024 ? 4 : 2)
      el.scrollBy({ left: cardWidth, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(advanceAuto, AUTO_SCROLL_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, advanceAuto])

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
    >
      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {displayed.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
          >
            <ProductGridItem product={product} />
          </div>
        ))}
      </div>

      {/* Prev arrow */}
      <button
        onClick={() => { scrollBy('left'); setIsPaused(true); setTimeout(() => setIsPaused(false), 4000) }}
        disabled={!canScrollLeft}
        aria-label="Previous products"
        className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-3 flex h-9 w-9 items-center justify-center border border-warm-border bg-linen text-charcoal shadow-sm transition-all hover:border-olive hover:text-olive disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Next arrow */}
      <button
        onClick={() => { scrollBy('right'); setIsPaused(true); setTimeout(() => setIsPaused(false), 4000) }}
        disabled={!canScrollRight}
        aria-label="Next products"
        className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-3 flex h-9 w-9 items-center justify-center border border-warm-border bg-linen text-charcoal shadow-sm transition-all hover:border-olive hover:text-olive disabled:opacity-0 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
