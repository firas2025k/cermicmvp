import React from 'react'
import Link from 'next/link'

import type { CallToActionBlock as CTABlockProps, Page } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { cn } from '@/utilities/cn'

function resolveHref(link: NonNullable<NonNullable<CTABlockProps['links']>[number]['link']>): string | null {
  if (link.type === 'reference' && typeof link.reference?.value === 'object') {
    const page = link.reference.value as Page
    if (page?.slug) {
      return page.slug === 'home' ? '/' : `/${page.slug}`
    }
  }
  return link.url || null
}

const buttonJustify = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const

export const CallToActionBlock: React.FC<
  CTABlockProps & {
    id?: string | number
    className?: string
  }
> = ({ links, richText, buttonAlignment: buttonAlignmentProp, className }) => {
  const hasText = Boolean(richText)
  const hasLinks = (links?.length ?? 0) > 0
  if (!hasText && !hasLinks) return null

  const buttonAlignment =
    buttonAlignmentProp === 'left' || buttonAlignmentProp === 'center'
      ? buttonAlignmentProp
      : 'right'

  return (
    <section className={cn('max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20', className)}>
      <div
        className={cn(
          'flex flex-col gap-10 border-y border-warm-border py-12 lg:py-16',
          hasText && buttonAlignment === 'center' && 'items-center text-center',
          hasText && buttonAlignment === 'left' && 'md:flex-row md:items-center md:justify-start md:gap-16',
          hasText && buttonAlignment === 'right' && 'md:flex-row md:items-center md:justify-between md:gap-16',
          !hasText && 'md:flex-row md:items-center',
          !hasText && buttonJustify[buttonAlignment],
        )}
      >
        {hasText ? (
          <div
            className={cn(
              'cta-content max-w-2xl',
              buttonAlignment !== 'center' && 'flex-1',
            )}
          >
            <RichText className="mb-0" data={richText!} enableGutter={false} />
          </div>
        ) : null}

        {hasLinks ? (
          <div
            className={cn(
              'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center shrink-0',
              hasText && buttonJustify[buttonAlignment],
              hasText && buttonAlignment === 'center' && 'w-full',
            )}
          >
            {(links || []).map(({ link }, i) => {
              const href = resolveHref(link)
              if (!href || !link.label) return null

              const isOutline = link.appearance === 'outline'
              const newTabProps = link.newTab
                ? { rel: 'noopener noreferrer', target: '_blank' as const }
                : {}

              return (
                <Link
                  key={i}
                  href={href}
                  {...newTabProps}
                  className={cn(
                    'inline-block px-8 py-3.5 font-sans text-xs tracking-[0.12em] uppercase transition-colors rounded-none text-center',
                    isOutline
                      ? 'border border-olive text-olive hover:bg-olive hover:text-linen'
                      : 'border border-charcoal bg-charcoal text-linen hover:bg-transparent hover:text-charcoal',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>

      <style>{`
        .cta-content p {
          font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
          font-size: 1rem;
          font-weight: 300;
          color: #8C8680;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .cta-content p:last-child {
          margin-bottom: 0;
        }
        .cta-content h1,
        .cta-content h2,
        .cta-content h3,
        .cta-content h4 {
          font-family: var(--font-serif, 'Cormorant Garamond', Georgia, serif);
          font-weight: 300;
          color: #2C2A27;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }
        .cta-content h2 {
          font-size: 2.25rem;
        }
        @media (min-width: 1024px) {
          .cta-content h2 {
            font-size: 3rem;
          }
        }
        .cta-content strong {
          font-weight: 500;
          color: #2C2A27;
        }
        .cta-content a {
          color: #4A5E3A;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
    </section>
  )
}
