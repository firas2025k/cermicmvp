import type { AboutUsBlock as AboutUsBlockProps } from '@/payload-types'
import React from 'react'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const AboutUsBlockComponent: React.FC<AboutUsBlockProps> = ({
  title = 'Über uns',
  image,
  imageCaption = 'Unser Team',
  content,
}) => {
  if (!content) return null

  return (
    <section className="border-b border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {image && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
              {typeof image === 'object' ? (
                <Media
                  resource={image}
                  className="h-full w-full object-cover"
                  imgClassName="h-full w-full object-cover"
                  width={1200}
                  height={900}
                />
              ) : (
                <div className="h-full w-full bg-neutral-200" />
              )}
              {imageCaption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
                  <p className="text-sm font-medium text-white">{imageCaption}</p>
                </div>
              )}
            </div>
          )}
          <div className="space-y-6">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {title}
              </h2>
            )}
            <RichText data={content} enableGutter={false} />
          </div>
        </div>
      </div>
    </section>
  )
}

