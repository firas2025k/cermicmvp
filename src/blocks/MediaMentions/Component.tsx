import type { MediaMentionsBlock as MediaMentionsBlockProps } from '@/payload-types'
import React from 'react'

export const MediaMentionsBlockComponent: React.FC<MediaMentionsBlockProps> = ({ outlets }) => {
  if (!outlets || outlets.length === 0) return null

  return (
    <section className="border-b border-neutral-200 bg-neutral-50 py-8 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
          {outlets.map((outlet, index) => (
            <span
              key={index}
              className="hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              {outlet.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

