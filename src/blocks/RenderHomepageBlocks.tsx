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

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div key={index}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore - weird type mismatch here */}
                  <Block id={toKebabCase(blockName!)} {...block} />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}

