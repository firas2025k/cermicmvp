'use client'

import { RichText } from '@/components/RichText'
import type { FeatureIconValue } from '@/globals/ProductFaqSection'
import type { Media, ProductFaqSection } from '@/payload-types'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import { useState } from 'react'

type FaqItem = NonNullable<ProductFaqSection['items']>[number]
type FeatureIcon = NonNullable<ProductFaqSection['featureIcons']>[number]

type Props = {
  data: ProductFaqSection
}

function FeatureIconSvg({ icon }: { icon: FeatureIconValue }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    viewBox: '0 0 24 24',
    className: 'h-6 w-6',
    'aria-hidden': true as const,
  }

  switch (icon) {
    case 'knifeFriendly':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l8-8M12 12l7-7M14 5l5 5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5c-1.2 1.8-3.8 2.2-5.2.8" />
        </svg>
      )
    case 'colorfulGrain':
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7c2.5 2 5.5 2 8 0s5.5-2 8 0M4 12c2.5 2 5.5 2 8 0s5.5-2 8 0M4 17c2.5 2 5.5 2 8 0s5.5-2 8 0"
          />
        </svg>
      )
    case 'foodSafe':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v10a2 2 0 104 0V3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 13v8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v7c0 1.7 1.3 3 3 3h0V3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v8" />
        </svg>
      )
    case 'antibacterial':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />
          <path strokeLinecap="round" d="M5 19L19 5" />
        </svg>
      )
    case 'easyCare':
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 14c2-3 4-5 5-7 1 2 3 4 5 7M5 18h14"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14c.8 1.5 1.5 2.5 3 4 1.5-1.5 2.2-2.5 3-4" />
        </svg>
      )
    default:
      return null
  }
}

function FaqAccordionRow({ item, defaultOpen = false }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-warm-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-olive"
        aria-expanded={open}
      >
        <span className="font-sans text-xs font-medium tracking-[0.08em] uppercase text-charcoal">
          {item.question}
        </span>
        <svg
          className={cn(
            'h-4 w-4 shrink-0 text-warm-gray transition-transform duration-200',
            open ? 'rotate-90' : 'rotate-0',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && item.answer && (
        <div className="pb-5 font-sans text-sm leading-relaxed text-warm-gray">
          <RichText
            className="prose prose-sm max-w-none text-warm-gray"
            data={item.answer}
            enableGutter={false}
          />
        </div>
      )}
    </div>
  )
}

export function GeneralProductFaq({ data }: Props) {
  const icons = (data.featureIcons ?? []).filter(
    (item): item is FeatureIcon => Boolean(item?.icon && item?.label),
  )
  const items = (data.items ?? []).filter((item) => item?.question && item?.answer)
  const image = typeof data.image === 'object' && data.image ? (data.image as Media) : null
  const heading = data.heading || 'Häufig gestellte Fragen'

  if (icons.length === 0 && items.length === 0 && !image) return null

  return (
    <section className="border-t border-warm-border bg-linen">
      <div className="container py-14 lg:py-20">
        {icons.length > 0 && (
          <ul className="mb-14 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:mb-16 lg:grid-cols-5 lg:gap-6">
            {icons.map((item, index) => (
              <li key={item.id ?? `${item.icon}-${index}`} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-charcoal text-linen">
                  <FeatureIconSvg icon={item.icon as FeatureIconValue} />
                </div>
                <p className="font-sans text-[11px] font-medium tracking-[0.12em] uppercase text-charcoal">
                  {item.label}
                </p>
              </li>
            ))}
          </ul>
        )}

        {(image || items.length > 0) && (
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-square overflow-hidden bg-[#EDE8DD]">
              {image?.url ? (
                <Image
                  src={image.url}
                  alt={image.alt || heading}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-[#E2DBD0]/50" />
              )}
            </div>

            <div>
              <h2 className="mb-6 font-sans text-2xl font-semibold tracking-[0.08em] uppercase text-charcoal md:text-3xl">
                {heading}
              </h2>
              <div className="border-t border-warm-border">
                {items.map((item, index) => (
                  <FaqAccordionRow
                    key={item.id ?? `${item.question}-${index}`}
                    item={item}
                    defaultOpen={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
