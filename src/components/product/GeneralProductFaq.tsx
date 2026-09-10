'use client'

import { RichText } from '@/components/RichText'
import type { Media, ProductFaqSection } from '@/payload-types'
import { FEATURE_ICON_MAP, type FeatureIconValue } from '@/utilities/featureIcons'
import { cn } from '@/utilities/cn'
import Image from 'next/image'
import { useState } from 'react'

type FaqItem = NonNullable<ProductFaqSection['items']>[number]
type FeatureIcon = NonNullable<ProductFaqSection['featureIcons']>[number]

type Props = {
  data: ProductFaqSection
}

function FeatureIconSvg({ icon }: { icon: string }) {
  const Icon = FEATURE_ICON_MAP[icon as FeatureIconValue] ?? FEATURE_ICON_MAP.unique
  return <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
}

function FaqAccordionRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)

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
                  <FeatureIconSvg icon={item.icon} />
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
                  <FaqAccordionRow key={item.id ?? `${item.question}-${index}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
