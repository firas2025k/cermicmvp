import type { ProductUsageBlock as ProductUsageBlockProps } from '@/payload-types'
import Link from 'next/link'
import React from 'react'

import { ProductUsageCarousel, ProductUsageTile } from './ProductUsageCarousel'

export const ProductUsageBlockComponent: React.FC<ProductUsageBlockProps> = ({ items }) => {
  if (!items || items.length === 0) return null

  const useCarousel = items.length > 3

  return (
    <>
      <div className="mx-auto flex max-w-7xl items-end justify-between px-6 py-16 lg:px-10">
        <div>
          <p className="mb-3 font-sans text-xs tracking-[0.3em] uppercase text-warm-gray">
            Entdecken
          </p>
          <h2 className="font-serif text-4xl font-light text-charcoal lg:text-5xl">
            Unsere Vielfalt
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden items-center rounded-none border border-olive px-6 py-2.5 font-sans text-sm tracking-wide text-olive transition-all duration-200 hover:bg-olive hover:text-linen md:inline-flex"
        >
          Alle ansehen
        </Link>
      </div>

      {useCarousel ? (
        <ProductUsageCarousel items={items} />
      ) : (
        <section
          className={`grid grid-cols-1 ${
            items.length === 1
              ? 'md:grid-cols-1'
              : items.length === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-2 lg:grid-cols-3'
          }`}
          aria-label="Unsere Vielfalt"
        >
          {items.map((item, index) => (
            <ProductUsageTile key={item.id ?? index} item={item} />
          ))}
        </section>
      )}

      <div className="px-6 pb-10 md:hidden">
        <Link
          href="/shop"
          className="inline-flex w-full items-center justify-center border border-olive px-6 py-2.5 font-sans text-sm tracking-wide text-olive transition-all duration-200 hover:bg-olive hover:text-linen"
        >
          Alle ansehen
        </Link>
      </div>
    </>
  )
}
