import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import type { Media as MediaType } from '@/payload-types'

type Panel = {
  image: MediaType | number | string | null
  eyebrow?: string | null
  title: string
  buttonText?: string | null
  buttonLink?: string | null
}

type Props = {
  leftPanel: Panel
  rightPanel: Panel
}

function HeroPanel({ panel }: { panel: Panel }) {
  const image = typeof panel.image === 'object' && panel.image ? (panel.image as MediaType) : null
  const href = panel.buttonLink || '/shop'

  return (
    <div className="relative overflow-hidden group" style={{ minHeight: '60vw' }}>
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

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 55%)' }}
      />

      {/* Panel content */}
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
            className="inline-flex items-center justify-center h-11 px-6 font-sans text-[0.72rem] font-bold tracking-[0.12em] uppercase text-white transition-colors duration-150"
            style={{ background: '#C4714A' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#A85A38')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#C4714A')}
          >
            {panel.buttonText}
          </Link>
        )}
      </div>
    </div>
  )
}

export const HeroSplitBlockComponent: React.FC<Props> = ({ leftPanel, rightPanel }) => {
  if (!leftPanel || !rightPanel) return null

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2"
      style={{ minHeight: '88vh' }}
      aria-label="Hero"
    >
      <HeroPanel panel={leftPanel} />
      <HeroPanel panel={rightPanel} />
    </section>
  )
}
