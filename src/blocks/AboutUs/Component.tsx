import type { AboutUsBlock as AboutUsBlockProps } from '@/payload-types'
import type { Media as MediaType } from '@/payload-types'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@/components/RichText'

export const AboutUsBlockComponent: React.FC<AboutUsBlockProps> = ({
  title,
  image,
  content,
}) => {
  if (!content) return null

  const img = typeof image === 'object' && image ? (image as MediaType) : null

  return (
    <section id="story" className="max-w-7xl mx-auto px-6 lg:px-10 py-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Image column ──────────────────────────────────────────────── */}
        <div className="relative">
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/5' }}>
            {img?.url ? (
              <Image
                src={img.url}
                alt={img.alt || title || 'Our story'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[#E2DBD0]" />
            )}
          </div>
          {/* Decorative olive-tinted square behind the image */}
          <div
            className="absolute -bottom-6 -right-6 w-40 h-40 -z-10"
            style={{ background: 'rgba(74,94,58,0.10)' }}
            aria-hidden
          />
        </div>

        {/* ── Text column ───────────────────────────────────────────────── */}
        <div>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-warm-gray mb-4">
            Our Story
          </p>

          {title && (
            <h2 className="font-serif text-4xl lg:text-5xl font-light text-charcoal leading-tight mb-8">
              {title}
            </h2>
          )}

          {/* Rich text — styled to match warm-gray light-weight paragraphs */}
          <div className="about-us-content mb-10">
            <RichText data={content} enableGutter={false} />
          </div>

          <Link
            href="/shop"
            className="inline-block px-8 py-3.5 font-sans text-sm tracking-wide border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200 rounded-none"
          >
            Learn More
          </Link>
        </div>

      </div>

      {/* Scoped prose overrides for the RichText body */}
      <style>{`
        .about-us-content p {
          font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
          font-size: 1rem;
          font-weight: 300;
          color: #8C8680;
          line-height: 1.75;
          margin-bottom: 1.5rem;
        }
        .about-us-content p:last-child {
          margin-bottom: 0;
        }
        .about-us-content h1,
        .about-us-content h2,
        .about-us-content h3,
        .about-us-content h4 {
          font-family: var(--font-serif, 'Cormorant Garamond', Georgia, serif);
          font-weight: 300;
          color: #2C2A27;
          margin-bottom: 1rem;
        }
        .about-us-content strong {
          font-weight: 500;
          color: #2C2A27;
        }
        .about-us-content em {
          font-style: italic;
        }
        .about-us-content a {
          color: #4A5E3A;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
    </section>
  )
}
