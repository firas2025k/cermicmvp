import configPromise from '@payload-config'
import { buildLlmsTxtMarkdown, getPublicSiteBaseUrl } from '@/utilities/llmsTxt'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const PRODUCT_CAP = 50

export async function GET(): Promise<Response> {
  const base = getPublicSiteBaseUrl()
  const sections: string[] = [buildLlmsTxtMarkdown(base).trimEnd(), '', '## CMS-Seiten']

  try {
    const payload = await getPayload({ config: configPromise })

    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
        title: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    })

    for (const page of pages.docs) {
      if (!page.slug || page.slug === 'home') continue
      const title = page.title || page.slug
      sections.push(`- [${title}](${base}/${page.slug})`)
    }

    sections.push('', `## Produkte (max. ${PRODUCT_CAP})`)

    const products = await payload.find({
      collection: 'products',
      depth: 0,
      limit: PRODUCT_CAP,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
        title: true,
      },
      sort: 'title',
      where: {
        _status: {
          equals: 'published',
        },
      },
    })

    for (const product of products.docs) {
      if (!product.slug) continue
      const title = product.title || product.slug
      sections.push(`- [${title}](${base}/products/${product.slug})`)
    }
  } catch {
    sections.push('', '_Produkt- und Seitenliste konnte vorübergehend nicht geladen werden._')
  }

  const body = `${sections.join('\n')}\n`

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
