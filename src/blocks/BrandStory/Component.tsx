import type { BrandStoryBlock as BrandStoryBlockProps } from '@/payload-types'
import React from 'react'
import Link from 'next/link'
import { RichText } from '@/components/RichText'
import { Media } from '@/components/Media'

export const BrandStoryBlockComponent: React.FC<BrandStoryBlockProps> = ({
  title,
  content,
  backgroundImage,
  links,
}) => {
  const backgroundImageUrl =
    backgroundImage && typeof backgroundImage === 'object'
      ? typeof backgroundImage.url === 'string'
        ? backgroundImage.url
        : null
      : null

  return (
    <section className="relative border-b border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Background image */}
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-stone-50 opacity-50 dark:from-amber-900/20 dark:to-neutral-900" />
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-12 text-center shadow-xl dark:bg-neutral-900">
          {title && (
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {title}
            </h2>
          )}
          {content && (
            <div className="mx-auto max-w-2xl">
              <RichText data={content} enableGutter={false} />
            </div>
          )}
          {links && links.length > 0 && (
            <div className="mt-8">
              {links.map((linkItem, index) => {
                if (!linkItem.link) return null
                const link = linkItem.link
                const url = link.type === 'reference' && link.reference && typeof link.reference === 'object' 
                  ? `/${link.reference.slug}` 
                  : link.url || '/shop'
                const label = link.label || 'Mehr erfahren'

                return (
                  <Link
                    key={index}
                    href={url}
                    className="mt-8 inline-flex rounded-full bg-amber-800 px-8 py-3 text-base font-medium text-white shadow-lg transition hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700"
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

