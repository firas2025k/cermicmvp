import { getServerSideURL } from './getURL'

/** Build an absolute URL from a path or return absolute URLs unchanged. */
export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  const base = getServerSideURL().replace(/\/$/, '')
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${base}${path}`
}
