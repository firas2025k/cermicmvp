'use client'

import { Media } from '@/components/Media'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isPaused, slides.length])

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
      className="relative h-[70vh] min-h-[500px] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Image */}
      <div className="absolute inset-0">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="container relative z-10 flex h-full items-end pb-16 md:pb-24">
        <div className="max-w-2xl space-y-6">
          {currentSlide.title && (
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {currentSlide.title}
            </h1>
          )}
          {currentSlide.subtitle && (
            <p className="text-lg text-white/90 md:text-xl">{currentSlide.subtitle}</p>
          )}
          {currentSlide.buttonText && currentSlide.buttonLink && (
            <Link
              href={currentSlide.buttonLink}
              className="inline-block rounded-md bg-white px-6 py-3 text-base font-medium text-neutral-900 transition hover:bg-neutral-100"
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
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white md:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-neutral-900" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white md:right-8"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-neutral-900" />
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
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

