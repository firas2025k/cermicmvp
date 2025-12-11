import type { PartnerLogosBlock as PartnerLogosBlockProps } from '@/payload-types'
import React from 'react'
import { Star } from 'lucide-react'

export const PartnerLogosBlockComponent: React.FC<PartnerLogosBlockProps> = ({
  partners,
  showRating = true,
}) => {
  if (!partners || partners.length === 0) return null

  return (
    <section className="border-b border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex h-16 items-center justify-center text-xl font-semibold text-neutral-400 transition hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400"
            >
              {partner.name}
            </div>
          ))}
        </div>
        {showRating && (
          <div className="mt-8 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

