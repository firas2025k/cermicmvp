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
    <section className={`border-b border-neutral-200 ${bgClasses[backgroundColor]} py-12 dark:border-neutral-800`}>
      <div className="container">
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: `repeat(${features.length}, 1fr)` }}
        >
          {features.map((feature, index) => {
            const image = typeof feature.image === 'object' ? feature.image : null

            return (
              <div key={index} className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-sm shadow-xl overflow-hidden">
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
                    <h3 className="text-sm font-semibold text-white">{feature.label}</h3>
                  )}
                  {feature.description && (
                    <p className="mt-1 text-xs text-red-100">{feature.description}</p>
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

