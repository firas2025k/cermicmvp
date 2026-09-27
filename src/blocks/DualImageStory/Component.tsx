import type { Media as MediaType } from '@/payload-types'
import Image from 'next/image'
import React from 'react'

export type DualImageStoryBlockProps = {
  title?: string | null
  leftImage?: (number | null) | MediaType
  rightImage?: (number | null) | MediaType
  leftWidthPercent?: number | null
  description?: string | null
  id?: string | null
  blockName?: string | null
  blockType?: 'dualImageStory'
}

function resolveMedia(image: DualImageStoryBlockProps['leftImage']): MediaType | null {
  return typeof image === 'object' && image ? image : null
}

export const DualImageStoryBlockComponent: React.FC<DualImageStoryBlockProps> = ({
  title,
  leftImage,
  rightImage,
  leftWidthPercent,
  description,
  id,
}) => {
  if (!title && !description && !leftImage && !rightImage) return null

  const left = resolveMedia(leftImage)
  const right = resolveMedia(rightImage)

  const leftPctRaw =
    typeof leftWidthPercent === 'number' && Number.isFinite(leftWidthPercent)
      ? leftWidthPercent
      : 70
  const leftPct = Math.min(80, Math.max(20, Math.round(leftPctRaw)))
  const rightPct = 100 - leftPct

  return (
    <section
      id={id || undefined}
      className="border-b border-warm-border"
      style={{ background: '#F8F4EE' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        {title ? (
          <h2 className="mb-8 lg:mb-10 font-sans text-sm md:text-base font-medium tracking-[0.14em] uppercase text-charcoal">
            {title}
          </h2>
        ) : null}

        <div
          className="grid grid-cols-1 gap-3 md:gap-4 mb-8 lg:mb-10 md:[grid-template-columns:var(--dual-left)_minmax(0,1fr)]"
          style={{ ['--dual-left' as string]: `${leftPct}%` }}
        >
          <div className="relative w-full overflow-hidden bg-[rgba(226,219,208,0.45)] aspect-[4/3] md:aspect-auto md:h-[min(28rem,55vw)]">
            {left?.url ? (
              <Image
                src={left.url}
                alt={left.alt || title || 'Ausstellungsbild'}
                fill
                className="object-cover"
                sizes={`(max-width: 768px) 100vw, ${leftPct}vw`}
              />
            ) : null}
          </div>

          <div className="relative w-full overflow-hidden bg-[rgba(226,219,208,0.45)] aspect-[3/4] md:aspect-auto md:h-[min(28rem,55vw)]">
            {right?.url ? (
              <Image
                src={right.url}
                alt={right.alt || title || 'Detailbild'}
                fill
                className="object-cover"
                sizes={`(max-width: 768px) 100vw, ${rightPct}vw`}
              />
            ) : null}
          </div>
        </div>

        {description ? (
          <p className="max-w-3xl font-sans text-base font-light leading-relaxed text-warm-gray whitespace-pre-line">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  )
}
