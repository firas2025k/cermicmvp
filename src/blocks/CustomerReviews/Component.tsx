import type { CustomerReviewsBlock as CustomerReviewsBlockProps } from '@/payload-types'
import React from 'react'
import { Star } from 'lucide-react'
import { Media } from '@/components/Media'
import Link from 'next/link'

export const CustomerReviewsBlockComponent: React.FC<CustomerReviewsBlockProps> = ({
  title = 'Kundenbewertungen',
  showViewAll = true,
  viewAllLink = '/reviews',
  reviews,
}) => {
  if (!reviews || reviews.length === 0) return null

  return (
    <section className="border-b border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {title}
          </h2>
          {showViewAll && (
            <Link
              href={viewAllLink}
              className="text-sm font-medium text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400"
            >
              Alle ansehen
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {reviews.map((review, index) => {
            const image = typeof review.image === 'object' ? review.image : null
            const rating = review.rating || 5

            return (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
              >
                {image ? (
                  <Media
                    resource={image}
                    className="h-full w-full object-cover"
                    imgClassName="h-full w-full object-cover"
                    width={400}
                    height={400}
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-200" />
                )}
                {/* Overlay with rating */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <div className="text-center w-full">
                    <div className="mb-2 flex items-center justify-center gap-1">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-white">{review.title}</p>
                  </div>
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 bg-black/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <svg
                      className="h-8 w-8 text-neutral-900"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l6.893-4.158a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

