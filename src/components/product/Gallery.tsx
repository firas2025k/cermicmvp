'use client'

import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
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
  const hasMultiple = slideCount > 1
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

  // Keep the active desktop thumbnail visible in the vertical strip
  useEffect(() => {
    const root = thumbsRef.current
    if (!root || !hasMultiple) return
    const thumb = root.querySelector<HTMLElement>(`[data-thumb-index="${safeIndex}"]`)
    thumb?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [safeIndex, hasMultiple])

  const onTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiple) return
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple || touchStartX.current == null || touchStartY.current == null) return

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
        // Desktop: thumbs left, main right
        hasMultiple && 'lg:grid lg:grid-cols-[84px_minmax(0,1fr)] lg:gap-3.5',
      )}
    >
      <Suspense fallback={null}>
        <GallerySearchSync gallery={slides} onMatch={setCurrent} />
      </Suspense>

      <div className="min-w-0">
        {/* Main image — full-width, swipeable on mobile */}
        <div
          className="relative aspect-square w-full min-w-0 touch-pan-y overflow-hidden bg-[#EDE8DD] select-none"
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
        </div>

        {/* Mobile/tablet: pill + dot indicators under the image (no thumbnails) */}
        {hasMultiple && (
          <div
            className="mt-3 flex items-center justify-center gap-1.5 lg:hidden"
            role="tablist"
            aria-label="Bildauswahl"
          >
            {slides.map((_, i) => {
              const isActive = i === safeIndex
              return (
                <button
                  key={`dot-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Bild ${i + 1} von ${slideCount}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    isActive
                      ? 'h-1.5 w-5 bg-charcoal'
                      : 'h-1.5 w-1.5 bg-warm-border hover:bg-warm-gray',
                  )}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop only: vertical thumbnail strip */}
      {hasMultiple && (
        <div
          ref={thumbsRef}
          className="scrollbar-hide hidden lg:order-first lg:flex lg:h-0 lg:min-h-full lg:flex-col lg:gap-2 lg:overflow-x-hidden lg:overflow-y-auto"
        >
          {slides.map((item, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              data-thumb-index={i}
              onClick={() => goTo(i)}
              onMouseEnter={() => goTo(i)}
              onFocus={() => goTo(i)}
              aria-label={`Bild ${i + 1} ansehen`}
              aria-current={i === safeIndex ? 'true' : undefined}
              className={cn(
                'h-[84px] w-[84px] shrink-0 overflow-hidden bg-[#EDE8DD] transition-all duration-200',
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
