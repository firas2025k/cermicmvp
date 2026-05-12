import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import type { HeroSplitBlock as HeroSplitBlockProps, Media as MediaType } from '@/payload-types'

type Panel = NonNullable<HeroSplitBlockProps['leftPanel']>
type MarqueeItem = NonNullable<NonNullable<HeroSplitBlockProps['marqueeItems']>[number]>
type Props = HeroSplitBlockProps

// ── Single image panel ──────────────────────────────────────────────────────
function HeroPanel({ panel }: { panel: Panel }) {
  const image = typeof panel.image === 'object' && panel.image ? (panel.image as MediaType) : null
  const href = panel.buttonLink || '/shop'

  return (
    <div className="relative overflow-hidden group" style={{ minHeight: '55vw' }}>
      {/* Background image with hover zoom */}
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt || panel.title}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-[#E2DBD0]" />
      )}

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 55%)' }}
      />

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        {panel.eyebrow && (
          <p className="font-sans text-[0.65rem] font-bold tracking-[0.22em] uppercase mb-2.5 opacity-80">
            {panel.eyebrow}
          </p>
        )}
        <h2
          className="font-sans font-extrabold tracking-tight leading-[1.05] mb-5"
          style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', letterSpacing: '-0.03em' }}
        >
          {panel.title}
        </h2>
        {panel.buttonText && (
          <Link
            href={href}
            className="inline-flex items-center justify-center h-11 px-6 font-sans text-[0.72rem] font-bold tracking-[0.12em] uppercase text-white bg-[#C4714A] hover:bg-[#A85A38] transition-colors duration-150"
          >
            {panel.buttonText}
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Marquee strip ───────────────────────────────────────────────────────────
function MarqueeStrip({ items }: { items: MarqueeItem[] }) {
  // Duplicate list so the animation loops seamlessly
  const doubled = [...items, ...items]

  return (
    <div
      className="overflow-hidden py-3"
      style={{ background: '#2C2A27' }}
      aria-label="Announcements"
    >
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          width: 'max-content',
          animation: 'marquee-scroll 22s linear infinite',
        }}
      >
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <span className="font-sans text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white">
              {item.text}
            </span>
            <span className="font-sans text-[0.65rem] font-bold" style={{ color: '#C4714A' }}>
              ✦
            </span>
          </React.Fragment>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

// ── Block entry point ───────────────────────────────────────────────────────
export const HeroSplitBlockComponent: React.FC<Props> = ({
  leftPanel,
  rightPanel,
  marqueeItems,
}) => {
  if (!leftPanel || !rightPanel) return null

  return (
    <>
      <section
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ minHeight: '88vh' }}
        aria-label="Hero"
      >
        <HeroPanel panel={leftPanel} />
        <HeroPanel panel={rightPanel} />
      </section>

      {marqueeItems && marqueeItems.length > 0 && (
        <MarqueeStrip items={marqueeItems} />
      )}
    </>
  )
}
