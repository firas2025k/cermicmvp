import { RichText } from '@/components/RichText'
import type { InquiryBlock as InquiryBlockProps, Media as MediaType } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const InquiryBlockComponent: React.FC<InquiryBlockProps> = ({
  title,
  image,
  imagePosition = 'imageRight',
  content,
  learnMoreLabel,
  learnMoreUrl,
}) => {
  if (!content) return null

  const img = typeof image === 'object' && image ? (image as MediaType) : null
  const imageOnRight = imagePosition === 'imageRight'

  return (
    <section id="inquiry" className="max-w-7xl mx-auto px-6 lg:px-10 py-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className={`relative ${imageOnRight ? 'lg:order-2' : ''}`}>
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/5' }}>
            {img?.url ? (
              <Image
                src={img.url}
                alt={img.alt || title || 'Inquiry'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[#E2DBD0]" />
            )}
          </div>
          <div
            className={`absolute -bottom-6 w-40 h-40 -z-10 ${imageOnRight ? '-left-6' : '-right-6'}`}
            style={{ background: 'rgba(74,94,58,0.10)' }}
            aria-hidden
          />
        </div>

        <div className={imageOnRight ? 'lg:order-1' : undefined}>
          {title && (
            <h2 className="font-serif text-4xl lg:text-5xl font-light text-charcoal leading-tight mb-8">
              {title}
            </h2>
          )}

          <div className="inquiry-content mb-10">
            <RichText data={content} enableGutter={false} />
          </div>

          {learnMoreLabel && (
            <Link
              href={learnMoreUrl || '/anfrage'}
              className="inline-block px-8 py-3.5 font-sans text-sm tracking-wide border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200 rounded-none"
            >
              {learnMoreLabel}
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .inquiry-content p {
          font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
          font-size: 1rem;
          font-weight: 300;
          color: #8C8680;
          line-height: 1.75;
          margin-bottom: 1.5rem;
        }
        .inquiry-content p:last-child {
          margin-bottom: 0;
        }
        .inquiry-content h1,
        .inquiry-content h2,
        .inquiry-content h3,
        .inquiry-content h4 {
          font-family: var(--font-serif, 'Cormorant Garamond', Georgia, serif);
          font-weight: 300;
          color: #2C2A27;
          margin-bottom: 1rem;
        }
        .inquiry-content strong {
          font-weight: 500;
          color: #2C2A27;
        }
        .inquiry-content em {
          font-style: italic;
        }
        .inquiry-content a {
          color: #4A5E3A;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
    </section>
  )
}
