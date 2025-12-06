'use client'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { GridTileImage } from '@/components/Grid/tile'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DefaultDocumentIDType } from 'payload'

type Props = {
  gallery: NonNullable<Product['gallery']>
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0)

  // Sync active image with selected variant (if present in search params)
  useEffect(() => {
    const values = searchParams.values().toArray()

    if (values) {
      const index = gallery.findIndex((item) => {
        if (!item.variantOption) return false

        let variantID: DefaultDocumentIDType

        if (typeof item.variantOption === 'object') {
          variantID = item.variantOption.id
        } else variantID = item.variantOption

        return Boolean(values.find((value) => value === String(variantID)))
      })

      if (index !== -1) {
        setCurrent(index)
      }
    }
  }, [searchParams, gallery])

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      {/* Thumbnails column */}
      <div className="order-2 flex gap-3 md:order-1 md:flex-col md:gap-3 md:pr-4">
        {gallery.map((item, i) => {
          if (typeof item.image !== 'object') return null

          return (
            <button
              key={`${item.image.id}-${i}`}
              type="button"
              onClick={() => setCurrent(i)}
              className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 transition hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-500"
              aria-label={`View image ${i + 1}`}
            >
              <GridTileImage active={i === current} media={item.image} />
            </button>
          )
        })}
      </div>

      {/* Main image */}
      <div className="order-1 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 md:order-2 dark:border-neutral-800 dark:bg-neutral-950">
        <Media
          resource={gallery[current].image}
          className="w-full"
          imgClassName="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
