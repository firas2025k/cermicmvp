import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Handgefertigte Olivenholzprodukte von Nabea – nachhaltig gefertigt in Österreich, Versand aus Wien.',
  locale: 'de_AT',
  siteName: 'Nabea',
  title: 'Nabea | Handgefertigte Olivenholzprodukte',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : undefined,
  }
}
