'use client'

import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
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

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0)

  // Sync active image when a variant option is selected (via URL params)
  useEffect(() => {
    const selectedOptionIDs = Array.from(searchParams.entries())
      .filter(([key]) => key !== 'variant' && key !== 'image')
      .map(([, value]) => value)

    if (selectedOptionIDs.length) {
      const index = gallery.findIndex((item) => {
        if (!item.variantOption) return false
        const variantID =
          typeof item.variantOption === 'object'
            ? String((item.variantOption as { id: DefaultDocumentIDType }).id)
            : String(item.variantOption)
        return selectedOptionIDs.includes(variantID)
      })
      if (index !== -1) setCurrent(index)
    }
  }, [searchParams, gallery])

  const activeImage = gallery[current]?.image

  return (
    <div className="flex gap-3.5">
      {/* Thumbnail column */}
      {gallery.length > 1 && (
        <div className="flex w-[84px] flex-shrink-0 flex-col gap-2">
          {gallery.map((item, i) => {
            if (typeof item.image !== 'object' || !item.image?.url) return null
            return (
              <button
                key={`${item.image.id ?? i}-thumb`}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  'h-[84px] w-[84px] flex-shrink-0 overflow-hidden bg-[#EDE8DD] transition-all duration-200',
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

      {/* Main image */}
      <div className="group relative flex-1 overflow-hidden bg-[#EDE8DD]" style={{ aspectRatio: '1' }}>
        {activeImage && typeof activeImage === 'object' && activeImage.url ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? ''}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : null}

        {/* Zoom hint */}
        <span className="absolute bottom-3 right-3 bg-[rgba(248,244,238,0.92)] px-2.5 py-1.5 font-sans text-[10px] font-semibold tracking-[0.1em] uppercase text-charcoal opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none select-none">
          Hover to zoom
        </span>
      </div>
    </div>
  )
}
