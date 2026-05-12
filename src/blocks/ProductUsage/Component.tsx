import type { ProductUsageBlock as ProductUsageBlockProps } from '@/payload-types'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'

function getItemHref(item: NonNullable<ProductUsageBlockProps['items']>[number]): string {
  if (item.linkType === 'product' && item.product) {
    const product = typeof item.product === 'object' ? item.product : null
    if (product && 'slug' in product && product.slug) {
      return `/products/${product.slug}`
    }
  }
  return item.link || '/shop'
}

export const ProductUsageBlockComponent: React.FC<ProductUsageBlockProps> = ({ items }) => {
  if (!items || items.length === 0) return null

  return (
    <>
      {/* ── Section label ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 flex items-end justify-between">
        <div>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-warm-gray mb-3">
            Explore
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl font-light text-charcoal">
            Our Collections
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline-flex items-center px-6 py-2.5 font-sans text-sm tracking-wide border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200 rounded-none"
        >
          View All
        </Link>
      </div>

      {/* ── Collection tiles ───────────────────────────────────────────── */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        aria-label="Our Collections"
      >
        {items.map((item, index) => {
          const image = typeof item.image === 'object' ? (item.image as MediaType) : null
          const href = getItemHref(item)

          return (
            <Link
              key={index}
              href={href}
              // Hide the 3rd tile on md (2-col) only — visible on sm (1-col) and lg (3-col)
              className={`relative overflow-hidden group block bg-[#E2DBD0]${index === 2 ? ' hidden md:hidden lg:block' : ''}`}
              style={{ aspectRatio: '4/5' }}
            >
              {/* Background image with hover zoom */}
              {image?.url ? (
                <Image
                  src={image.url}
                  alt={image.alt || item.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[#E2DBD0]" />
              )}

              {/* Bottom gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(44,42,39,0.62) 0%, transparent 55%)',
                }}
              />

              {/* Tile content */}
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
        })}
      </section>
    </>
  )
}
