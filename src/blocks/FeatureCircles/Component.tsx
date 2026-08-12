import type { FeatureCirclesBlock as FeatureCirclesBlockProps } from '@/payload-types'
import React from 'react'
import { Media } from '@/components/Media'

export const FeatureCirclesBlockComponent: React.FC<FeatureCirclesBlockProps> = ({
  features,
  backgroundColor = 'red',
}) => {
  if (!features || features.length === 0) return null

  const bgClasses = {
    red: 'bg-gradient-to-b from-red-900/95 via-red-800/90 to-red-900/95',
    amber: 'bg-gradient-to-b from-amber-900/95 via-amber-800/90 to-amber-900/95',
    neutral: 'bg-gradient-to-b from-neutral-900/95 via-neutral-800/90 to-neutral-900/95',
  }

  return (
    <section
      className={`overflow-x-hidden border-b border-neutral-200 ${bgClasses[backgroundColor]} py-8 sm:py-12 dark:border-neutral-800`}
    >
      <div className="container">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const image = typeof feature.image === 'object' ? feature.image : null

            return (
              <div key={index} className="mx-auto flex w-full max-w-xs flex-col items-center gap-3 sm:gap-4">
                <div className="relative h-24 w-24 shrink-0 rounded-full border-4 border-white/20 bg-white/10 shadow-xl backdrop-blur-sm overflow-hidden sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                  {image ? (
                    <Media
                      resource={image}
                      className="h-full w-full object-cover"
                      imgClassName="h-full w-full object-cover"
                      width={128}
                      height={128}
                    />
                  ) : (
                    <div className="h-full w-full bg-white/10" />
                  )}
                </div>
                <div className="text-center">
                  {feature.label && (
                    <h3 className="text-sm font-semibold text-white sm:text-base">{feature.label}</h3>
                  )}
                  {feature.description && (
                    <p className="mt-1 text-xs leading-relaxed text-white/80 sm:text-sm">{feature.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

