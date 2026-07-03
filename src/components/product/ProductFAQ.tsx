'use client'

import { RichText } from '@/components/RichText'
import type { Product } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { useState } from 'react'
import { STATIC_CARE_AND_SHIPPING, type AccordionItem } from './staticFaq'

function AccordionRow({
  item,
  defaultOpen = false,
}: {
  item: AccordionItem
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-warm-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-olive"
      >
        <span className="font-sans text-xs font-bold tracking-[0.1em] uppercase text-charcoal">
          {item.title}
        </span>
        <svg
          className={cn(
            'h-4 w-4 flex-shrink-0 text-warm-gray transition-transform duration-200',
            open && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-5 font-sans text-sm leading-relaxed text-warm-gray">
          {typeof item.body === 'string' ? (
            <span className="whitespace-pre-line">{item.body}</span>
          ) : (
            <RichText
              className="prose prose-sm max-w-none text-warm-gray"
              data={item.body as unknown as Parameters<typeof RichText>[0]['data']}
              enableGutter={false}
            />
          )}
        </div>
      )}
    </div>
  )
}

function DescriptionRow({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-warm-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-olive"
      >
        <span className="font-sans text-xs font-bold tracking-[0.1em] uppercase text-charcoal">
          Description
        </span>
        <svg
          className={cn(
            'h-4 w-4 flex-shrink-0 text-warm-gray transition-transform duration-200',
            open && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-5">
          <RichText
            className="prose prose-sm max-w-none font-sans text-warm-gray"
            data={product.description!}
            enableGutter={false}
          />
        </div>
      )}
    </div>
  )
}

export function ProductFAQ({ product }: { product: Product }) {
  const items: AccordionItem[] =
    product.faqItems && product.faqItems.length > 0
      ? product.faqItems
          .filter((item) => item.question && item.answer)
          .filter(
            (item) =>
              !product.description ||
              item.question.trim().toLowerCase() !== 'description',
          )
          .map((item) => ({ title: item.question!, body: item.answer! }))
      : STATIC_CARE_AND_SHIPPING

  const hasContent = product.description || items.length > 0
  if (!hasContent) return null

  return (
    <section className="border-t border-warm-border bg-linen">
      <div className="container py-10 lg:py-14">
        <div className="border-t border-warm-border">
          {product.description && <DescriptionRow product={product} />}
          {items.map((item, i) => (
            <AccordionRow
              key={item.title}
              item={item}
              defaultOpen={i === 0 && !product.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
