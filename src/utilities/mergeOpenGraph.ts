import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Handgefertigte Olivenholzprodukte und Keramik von Nabea – aus Österreich.',
  siteName: 'Nabea',
  title: 'Nabea',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : undefined,
  }
}
