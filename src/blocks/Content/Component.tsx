import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import type { DefaultDocumentIDType } from 'payload'
import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<
  ContentBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = (props) => {
  const { columns, title, description, className } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const hasHeader = Boolean(title || description)

  return (
    <div className={cn('container my-16', className)}>
      {hasHeader ? (
        <div className="mb-10 max-w-3xl">
          {title ? (
            <h2 className="font-serif text-4xl lg:text-5xl font-light text-charcoal leading-tight mb-4">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="font-sans text-base font-light leading-relaxed text-warm-gray whitespace-pre-line">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
