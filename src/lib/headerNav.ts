import type { Category, Header } from '@/payload-types'

export type HeaderNavItem = NonNullable<Header['navItems']>[number]

/** Resolved parent category when nav link type is "category" and relationship is populated. */
export function getNavCategory(link: HeaderNavItem['link'] | undefined): Category | null {
  if (!link || link.type !== 'category' || link.category == null) return null
  const c = link.category
  if (typeof c === 'object' && c !== null && 'slug' in c && typeof c.slug === 'string') {
    return c as Category
  }
  return null
}

export function categoryNavHref(category: Category): string {
  return `/shop?category=${encodeURIComponent(category.slug)}`
}
