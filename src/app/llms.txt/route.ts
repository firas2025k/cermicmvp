import { buildLlmsTxtMarkdown, getPublicSiteBaseUrl } from '@/utilities/llmsTxt'

export const dynamic = 'force-static'
export const revalidate = 3600

export function GET(): Response {
  const body = buildLlmsTxtMarkdown(getPublicSiteBaseUrl())

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
