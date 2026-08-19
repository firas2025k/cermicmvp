'use client'

import { Media } from '@/components/Media'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Media as MediaType } from '@/payload-types'

type HeroSlide = {
  id: string
  image: MediaType | number | string // Can be MediaType, number (ID), or string (path)
  title?: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
}

type Props = {
  slides: HeroSlide[]
  autoPlay?: boolean
  autoPlayInterval?: number
}

export const HeroCarousel: React.FC<Props> = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isPaused, slides.length])

  // Premium polish: fade content when changing slides.
  useEffect(() => {
    if (slides.length <= 1) return
    setIsFading(true)
    const t = window.setTimeout(() => setIsFading(false), 250)
    return () => window.clearTimeout(t)
  }, [currentIndex, slides.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const deltaX = touch.clientX - startX
      const deltaY = touch.clientY - startY

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setIsPaused(true)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const threshold = 50

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          goToPrevious()
        } else {
          goToNext()
        }
      }

      setTimeout(() => setIsPaused(false), 1000)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  if (slides.length === 0) return null

  const currentSlide = slides[currentIndex]

  return (
    <section
      className="relative h-[clamp(480px,70vh,720px)] min-h-[500px] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 motion-safe:duration-700 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {typeof currentSlide.image === 'string' ? (
          // Direct image path from public folder
          <img
            src={currentSlide.image}
            alt={currentSlide.title || 'Hero image'}
            className="h-full w-full object-cover"
          />
        ) : typeof currentSlide.image === 'object' && currentSlide.image ? (
          // MediaType object from Payload
          <Media
            resource={currentSlide.image}
            className="h-full w-full object-cover"
            imgClassName="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200" />
        )}
        {/* Theming overlay: charcoal readability + subtle olive warmth */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent" />
        <div className="absolute inset-0 bg-[rgba(74,94,58,0.12)]" />
      </div>

      {/* Content Overlay */}
      <div className="container relative z-10 flex h-full items-end pb-16 md:pb-24">
        <div
          className={`max-w-2xl transition-opacity duration-500 motion-safe:duration-700 ${
            isFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {currentSlide.title && (
            <h1 className="font-serif text-4xl font-light leading-tight text-linen md:text-5xl lg:text-6xl">
              {currentSlide.title}
            </h1>
          )}
          {currentSlide.subtitle && (
            <p className="mt-4 font-sans text-base text-linen/90 md:text-lg">
              {currentSlide.subtitle}
            </p>
          )}
          {currentSlide.buttonText && currentSlide.buttonLink && (
            <Link
              href={currentSlide.buttonLink}
              className="mt-8 inline-block rounded-none border border-olive bg-transparent px-6 py-3.5 font-sans text-xs tracking-[0.12em] uppercase text-linen transition-colors hover:bg-olive"
            >
              {currentSlide.buttonText}
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-charcoal/30 p-2 shadow-sm backdrop-blur-sm transition hover:bg-charcoal/45 md:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-linen" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-charcoal/30 p-2 shadow-sm backdrop-blur-sm transition hover:bg-charcoal/45 md:right-8"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-linen" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-linen/90'
                  : 'w-2 bg-linen/40 hover:bg-linen/65'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

