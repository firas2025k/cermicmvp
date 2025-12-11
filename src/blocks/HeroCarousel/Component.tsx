import type { HeroCarouselBlock as HeroCarouselBlockProps } from '@/payload-types'
import React from 'react'
import { HeroCarousel } from '@/components/HeroCarousel'
import type { Media as MediaType } from '@/payload-types'

export const HeroCarouselBlockComponent: React.FC<HeroCarouselBlockProps> = ({
  slides,
  autoPlay,
  autoPlayInterval,
}) => {
  if (!slides || slides.length === 0) return null

  // Transform slides to match HeroCarousel component format
  const transformedSlides = slides.map((slide) => {
    const image = typeof slide.image === 'object' ? slide.image : null

    return {
      id: slide.id || String(Math.random()),
      image: image || '',
      title: slide.title || undefined,
      subtitle: slide.subtitle || undefined,
      buttonText: slide.buttonText || undefined,
      buttonLink: slide.buttonLink || '/shop',
    }
  })

  return (
    <HeroCarousel
      slides={transformedSlides}
      autoPlay={autoPlay}
      autoPlayInterval={autoPlayInterval}
    />
  )
}

