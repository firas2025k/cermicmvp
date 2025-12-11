import type { GlobalConfig } from 'payload'

import { HeroCarouselBlock } from '@/blocks/HeroCarousel/config'
import { ProductCarouselBlock } from '@/blocks/ProductCarousel/config'
import { CategoryBannerBlock } from '@/blocks/CategoryBanner/config'
import { BrandStoryBlock } from '@/blocks/BrandStory/config'
import { FeatureCirclesBlock } from '@/blocks/FeatureCircles/config'
import { MediaMentionsBlock } from '@/blocks/MediaMentions/config'
import { PartnerLogosBlock } from '@/blocks/PartnerLogos/config'
import { CustomerReviewsBlock } from '@/blocks/CustomerReviews/config'
import { ProductUsageBlock } from '@/blocks/ProductUsage/config'
import { AboutUsBlock } from '@/blocks/AboutUs/config'
import { getServerSideURL } from '@/utilities/getURL'
import { revalidateHomepage } from './hooks/revalidateHomepage'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
  },
  admin: {
    livePreview: {
      url: () => {
        const serverURL = getServerSideURL()
        return `${serverURL}/`
      },
    },
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroCarouselBlock,
        ProductCarouselBlock,
        CategoryBannerBlock,
        BrandStoryBlock,
        FeatureCirclesBlock,
        MediaMentionsBlock,
        PartnerLogosBlock,
        CustomerReviewsBlock,
        ProductUsageBlock,
        AboutUsBlock,
      ],
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateHomepage],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 50,
  },
}

