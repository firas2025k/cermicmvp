'use client'

import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import type { DefaultDocumentIDType } from 'payload'
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type GalleryItem = {
  image: NonNullable<NonNullable<Product['gallery']>[number]['image']> & {
    url?: string | null
    alt?: string
    width?: number | null
    height?: number | null
  }
  variantOption?: { id: DefaultDocumentIDType } | number | null
  id?: string | null
}

type Props = {
  gallery: GalleryItem[]
}

const SWIPE_THRESHOLD_PX = 50

/**
 * Keeps the active image in sync with variant query params.
 * Isolated so `useSearchParams` does not force the whole gallery
 * behind a Suspense fallback (empty square until JS hydrates).
 */
const GallerySearchSync: React.FC<{
  gallery: GalleryItem[]
  onMatch: (index: number) => void
}> = ({ gallery, onMatch }) => {
  const searchParams = useSearchParams()

  useEffect(() => {
    const selectedOptionIDs = Array.from(searchParams.entries())
      .filter(([key]) => key !== 'variant' && key !== 'image')
      .map(([, value]) => value)

    if (!selectedOptionIDs.length) return

    const index = gallery.findIndex((item) => {
      if (!item.variantOption) return false
      const variantID =
        typeof item.variantOption === 'object'
          ? String((item.variantOption as { id: DefaultDocumentIDType }).id)
          : String(item.variantOption)
      return selectedOptionIDs.includes(variantID)
    })
    if (index !== -1) onMatch(index)
  }, [searchParams, gallery, onMatch])

  return null
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const [current, setCurrent] = useState(0)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const slides = useMemo(
    () =>
      gallery.filter(
        (item): item is GalleryItem & { image: { url: string } } =>
          typeof item.image === 'object' &&
          item.image != null &&
          typeof item.image.url === 'string' &&
          item.image.url.length > 0,
      ),
    [gallery],
  )

  const slideCount = slides.length
  const hasThumbs = slideCount > 1
  const safeIndex = slideCount === 0 ? 0 : Math.min(current, slideCount - 1)

  const goTo = useCallback(
    (index: number) => {
      if (slideCount <= 1) return
      setCurrent(((index % slideCount) + slideCount) % slideCount)
    },
    [slideCount],
  )

  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex])
  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex])

  // Keep the active thumbnail visible in the horizontal/vertical strip
  useEffect(() => {
    const root = thumbsRef.current
    if (!root || !hasThumbs) return
    const thumb = root.querySelector<HTMLElement>(`[data-thumb-index="${safeIndex}"]`)
    thumb?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [safeIndex, hasThumbs])

  const onTouchStart = (e: React.TouchEvent) => {
    if (!hasThumbs) return
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!hasThumbs || touchStartX.current == null || touchStartY.current == null) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    // Ignore mostly-vertical gestures so the page can still scroll
    if (Math.abs(deltaX) < Math.abs(deltaY)) return
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return

    if (deltaX > 0) goPrev()
    else goNext()
  }

  if (slideCount === 0) {
    return <div className="aspect-square w-full bg-[#EDE8DD]" />
  }

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-3',
        // Desktop: thumbs left, main right (reverse of previous flex-col-reverse)
        hasThumbs && 'lg:grid lg:grid-cols-[84px_minmax(0,1fr)] lg:gap-3.5',
      )}
    >
      <Suspense fallback={null}>
        <GallerySearchSync gallery={slides} onMatch={setCurrent} />
      </Suspense>

      {/* Main image — swipeable on touch devices */}
      <div
        className="group relative aspect-square w-full min-w-0 touch-pan-y overflow-hidden bg-[#EDE8DD] select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="Karussell"
        aria-label="Produktbilder"
      >
        {slides.map((item, i) => (
          <Image
            key={`main-${i}`}
            src={item.image.url}
            alt={item.image.alt ?? ''}
            fill
            draggable={false}
            className={cn(
              'pointer-events-none object-cover transition-opacity duration-500 ease-in-out',
              i === safeIndex ? 'opacity-100' : 'opacity-0',
            )}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={i === 0}
          />
        ))}

        {hasThumbs && (
          <>
            {/* Counter — mobile/tablet, matches reference (bottom-left) */}
            <p
              className="pointer-events-none absolute bottom-3 left-3 z-10 font-sans text-xs font-medium tracking-wide text-charcoal lg:hidden"
              aria-live="polite"
            >
              <span className="rounded-sm bg-linen/90 px-2 py-1 shadow-sm">
                {safeIndex + 1} / {slideCount}
              </span>
            </p>

            {/* Prev / next — large tap targets, mobile/tablet (bottom-right) */}
            <div className="absolute bottom-3 right-3 z-10 flex gap-2 lg:hidden">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Vorheriges Bild"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-warm-border/60 bg-linen/90 text-charcoal shadow-sm transition-colors active:bg-linen"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Nächstes Bild"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-warm-border/60 bg-linen/90 text-charcoal shadow-sm transition-colors active:bg-linen"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails: horizontal on mobile, vertical on desktop */}
      {hasThumbs && (
        <div
          ref={thumbsRef}
          className="scrollbar-hide flex w-full gap-2 overflow-x-auto lg:order-first lg:h-0 lg:min-h-full lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto"
        >
          {slides.map((item, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              data-thumb-index={i}
              onClick={() => goTo(i)}
              onMouseEnter={() => {
                // Desktop-only hover preview; mobile relies on tap / swipe / arrows
                if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                  goTo(i)
                }
              }}
              onFocus={() => goTo(i)}
              aria-label={`Bild ${i + 1} ansehen`}
              aria-current={i === safeIndex ? 'true' : undefined}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden bg-[#EDE8DD] transition-all duration-200 sm:h-[72px] sm:w-[72px] lg:h-[84px] lg:w-[84px]',
                i === safeIndex
                  ? 'border-2 border-charcoal'
                  : 'border-2 border-transparent hover:border-warm-border',
              )}
            >
              <Image
                src={item.image.url}
                alt={item.image.alt ?? ''}
                width={84}
                height={84}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
