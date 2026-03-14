'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

/**
 * Custom row label for Hero Carousel slides.
 * Ensures each slide row has a unique, stable identity in the admin form,
 * which helps prevent upload field state from bleeding between rows.
 */
export const HeroSlideRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string | null }>()

  const label = data?.title
    ? `Slide ${rowNumber}: ${data.title}`
    : `Slide ${String(rowNumber).padStart(2, '0')}`

  return <span>{label}</span>
}
