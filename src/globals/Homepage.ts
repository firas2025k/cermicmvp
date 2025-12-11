import type { GlobalConfig } from 'payload'

import { HeroCarouselBlock } from '@/blocks/HeroCarousel/config'
import { ProductCarouselBlock } from '@/blocks/ProductCarousel/config'
import { CategoryBannerBlock } from '@/blocks/CategoryBanner/config'
import { BrandStoryBlock } from '@/blocks/BrandStory/config'
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

