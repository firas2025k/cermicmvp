import type { ProductUsageBlock as ProductUsageBlockProps } from '@/payload-types'
import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'

export const ProductUsageBlockComponent: React.FC<ProductUsageBlockProps> = ({ items }) => {
  if (!items || items.length === 0) return null

  return (
    <section className="border-b border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => {
            const image = typeof item.image === 'object' ? item.image : null

            return (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
              >
                {image ? (
                  <Media
                    resource={image}
                    className="h-full w-full object-cover"
                    imgClassName="h-full w-full object-cover"
                    width={600}
                    height={600}
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end p-6">
                  {item.title && (
                    <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-sm text-white/90 mb-4">{item.description}</p>
                  )}
                  {item.link && (
                    <Link
                      href={item.link}
                      className="inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                    >
                      {item.linkText || 'Mehr erfahren'}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

