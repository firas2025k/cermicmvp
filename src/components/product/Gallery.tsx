'use client'

import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import { DefaultDocumentIDType } from 'payload'

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
  const activeImage = gallery[current]?.image

  const hasThumbs = gallery.length > 1

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col-reverse gap-3.5',
        // Desktop: main square sets row height; thumbs scroll inside that height
        hasThumbs && 'lg:grid lg:grid-cols-[84px_minmax(0,1fr)] lg:gap-3.5',
      )}
    >
      <Suspense fallback={null}>
        <GallerySearchSync gallery={gallery} onMatch={setCurrent} />
      </Suspense>

      {/* Thumbnails: horizontal slider on mobile, vertical slider on desktop */}
      {hasThumbs && (
        <div className="flex w-full gap-2 overflow-x-auto lg:h-0 lg:min-h-full lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
          {gallery.map((item, i) => {
            if (typeof item.image !== 'object' || !item.image?.url) return null
            return (
              <button
                key={`${item.image.id ?? i}-thumb`}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Bild ${i + 1} ansehen`}
                className={cn(
                  'h-[72px] w-[72px] shrink-0 overflow-hidden bg-[#EDE8DD] transition-all duration-200 lg:h-[84px] lg:w-[84px]',
                  i === current
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
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Main image — fixed square size regardless of thumbnail count */}
      <div className="group relative aspect-square w-full min-w-0 overflow-hidden bg-[#EDE8DD]">
        {activeImage && typeof activeImage === 'object' && activeImage.url ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? ''}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : null}
      </div>
    </div>
  )
}
