import { HeroCarouselBlockComponent } from '@/blocks/HeroCarousel/Component'
import { ProductCarouselBlockComponent } from '@/blocks/ProductCarousel/Component'
import { CategoryBannerBlockComponent } from '@/blocks/CategoryBanner/Component'
import { BrandStoryBlockComponent } from '@/blocks/BrandStory/Component'
import { FeatureCirclesBlockComponent } from '@/blocks/FeatureCircles/Component'
import { MediaMentionsBlockComponent } from '@/blocks/MediaMentions/Component'
import { PartnerLogosBlockComponent } from '@/blocks/PartnerLogos/Component'
import { CustomerReviewsBlockComponent } from '@/blocks/CustomerReviews/Component'
import { ProductUsageBlockComponent } from '@/blocks/ProductUsage/Component'
import { AboutUsBlockComponent } from '@/blocks/AboutUs/Component'
import { toKebabCase } from '@/utilities/toKebabCase'
import React, { Fragment } from 'react'

import type { Homepage } from '../payload-types'

const blockComponents = {
  heroCarousel: HeroCarouselBlockComponent,
  productCarousel: ProductCarouselBlockComponent,
  categoryBanner: CategoryBannerBlockComponent,
  brandStory: BrandStoryBlockComponent,
  featureCircles: FeatureCirclesBlockComponent,
  mediaMentions: MediaMentionsBlockComponent,
  partnerLogos: PartnerLogosBlockComponent,
  customerReviews: CustomerReviewsBlockComponent,
  productUsage: ProductUsageBlockComponent,
  aboutUs: AboutUsBlockComponent,
}

export const RenderHomepageBlocks: React.FC<{
  blocks: Homepage['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block

          // Debug logging (remove in production if needed)
          if (process.env.NODE_ENV === 'development') {
            console.log(`Rendering block ${index}:`, {
              blockType,
              blockName,
              hasBlockType: !!blockType,
              inComponents: blockType ? blockType in blockComponents : false,
            })
          }

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              try {
                return (
                  <div key={index}>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore - weird type mismatch here */}
                    <Block id={toKebabCase(blockName!)} {...block} />
                  </div>
                )
              } catch (error) {
                console.error(`Error rendering block ${blockType}:`, error)
                return (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600">
                      Error rendering block: {blockType}. Check console for details.
                    </p>
                  </div>
                )
              }
            }
          }

          // Log if block type is missing or not found
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Block type "${blockType}" not found in blockComponents`, {
              availableTypes: Object.keys(blockComponents),
            })
          }

          return null
        })}
      </Fragment>
    )
  }

  return null
}

