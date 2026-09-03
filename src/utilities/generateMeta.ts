import type { Metadata } from 'next'

import type { Media, Page, Product } from '../payload-types'

import { absoluteUrl } from './absoluteUrl'
import { mergeOpenGraph } from './mergeOpenGraph'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Nabea'
const DEFAULT_DESCRIPTION =
  'Handgefertigte Olivenholzprodukte und Keramik von Nabea – aus Österreich.'

function docPath(doc: Page | Product): string {
  const slug = typeof doc?.slug === 'string' ? doc.slug : ''

  if (!slug || slug === 'home') return '/'

  // Products use /products/{slug}; pages use /{slug}
  if ('priceInEUR' in doc || 'gallery' in doc || 'inventory' in doc) {
    return `/products/${slug}`
  }

  return `/${slug}`
}

function mediaUrl(image: Media | string | null | undefined): string | undefined {
  if (!image || typeof image !== 'object' || !image.url) return undefined
  return absoluteUrl(image.url)
}

export const generateMeta = async (args: { doc: Page | Product | null }): Promise<Metadata> => {
  const { doc } = args || {}

  if (!doc) {
    return {
      description: DEFAULT_DESCRIPTION,
      openGraph: mergeOpenGraph({
        description: DEFAULT_DESCRIPTION,
        title: SITE_NAME,
        url: '/',
      }),
      title: SITE_NAME,
    }
  }

  const path = docPath(doc)
  const canonical = absoluteUrl(path)
  const title = doc?.meta?.title || doc?.title || SITE_NAME
  const description = doc?.meta?.description || DEFAULT_DESCRIPTION
  const ogImage = mediaUrl(typeof doc?.meta?.image === 'object' ? doc.meta.image : null)

  return {
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    description,
    openGraph: mergeOpenGraph({
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: path,
    }),
    title,
  }
}
