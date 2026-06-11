import { ProductGridItem } from '@/components/ProductGridItem'
import { ShopFilterBar } from '@/components/ShopFilterBar'
import { getCategoryAndDescendantIds, organizeCategories } from '@/lib/categories'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'

export const metadata = {
  title: 'Shop',
  description: 'Browse our product collections.',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

function normalizeSearchQuery(q: string | string[] | undefined): string {
  if (q == null) return ''
  const s = Array.isArray(q) ? q[0] : q
  return typeof s === 'string' ? s.trim() : ''
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: rawQ, sort, category } = await searchParams
  const searchValue = normalizeSearchQuery(rawQ)
  const activeSort = typeof sort === 'string' ? sort : null
  const activeCategory = typeof category === 'string' ? category : null

  const payload = await getPayload({ config: configPromise })

  // Fetch all categories with parent relationships for the filter bar
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'order',
    depth: 1,
  })
  const categories = categoriesResult.docs || []
  const { topLevel, byParent } = organizeCategories(categories)

  // Expand the selected category slug into that category + all its descendants
  const categorySlugs = activeCategory ? [activeCategory] : []
  const categoryIdsToMatch: (number | string)[] = []
  let exactCategoryId: number | null = null

  for (const slug of categorySlugs) {
    const found = categories.find((c) => c.slug === slug)
    if (found && found.id != null) {
      categoryIdsToMatch.push(...getCategoryAndDescendantIds(found.id, byParent))
      if (exactCategoryId === null) exactCategoryId = found.id
    }
  }
  const uniqueCategoryIds = [...new Set(categoryIdsToMatch)]

  // Build Payload where conditions
  const whereConditions: any[] = [{ _status: { equals: 'published' } }]

  if (searchValue) {
    whereConditions.push({
      or: [{ title: { contains: searchValue } }, { slug: { contains: searchValue } }],
    })
  }

  if (uniqueCategoryIds.length > 0) {
    whereConditions.push({
      or: uniqueCategoryIds.map((id) => ({ categories: { contains: id } })),
    })
  }

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    depth: 2,
    limit: 100,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInEUR: true,
      compareAtPriceInEUR: true,
      inventory: true,
      enableVariants: true,
      variantTypes: true,
      variants: true,
    },
    populate: {
      variantTypes: {
        label: true,
        name: true,
        options: true,
      },
      variants: {
        options: true,
        priceInEUR: true,
        compareAtPriceInEUR: true,
      },
    } as Record<string, unknown>,
    sort: activeSort ?? 'title',
    where: { and: whereConditions },
  })

  // Apply per-category custom ordering when a single specific category is selected
  // and the editor has set explicit positions for it.
  let orderedDocs = products.docs
  if (!activeSort && exactCategoryId !== null && categorySlugs.length === 1) {
    const orderResult = await payload.find({
      collection: 'category-product-orders',
      where: { category: { equals: exactCategoryId } },
      limit: 500,
      depth: 0,
    })

    if (orderResult.docs.length > 0) {
      const positionMap = new Map<number | string, number>()
      for (const entry of orderResult.docs) {
        const productId =
          typeof entry.product === 'object' && entry.product !== null
            ? entry.product.id
            : entry.product
        if (productId != null) positionMap.set(productId, entry.position ?? 999)
      }

      orderedDocs = [...products.docs].sort((a, b) => {
        const posA = positionMap.get(a.id) ?? Number.MAX_SAFE_INTEGER
        const posB = positionMap.get(b.id) ?? Number.MAX_SAFE_INTEGER
        if (posA !== posB) return posA - posB
        return (a.title ?? '').localeCompare(b.title ?? '')
      })
    }
  }

  return (
    <div className="min-h-screen bg-linen">
      {/* Page header */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-12">
        <p className="font-sans text-xs tracking-[0.3em] uppercase text-warm-gray mb-3">Browse</p>
        <h1 className="font-serif text-5xl lg:text-6xl font-light text-charcoal">The Shop</h1>
      </section>

      {/* Sticky filter bar */}
      <Suspense fallback={<div className="h-[57px] border-y border-[#E2DBD0] bg-white" />}>
        <ShopFilterBar
          topLevel={topLevel}
          byParent={byParent}
          activeCategory={activeCategory}
          activeSort={activeSort}
          productCount={orderedDocs.length}
        />
      </Suspense>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        {/* Search feedback */}
        {searchValue && (
          <div className="mb-8 flex items-center justify-between">
            <p className="font-sans text-sm text-warm-gray">
              {orderedDocs.length === 0 ? 'No results' : orderedDocs.length}{' '}
              {orderedDocs.length === 1 ? 'result' : 'results'} for{' '}
              <span className="font-medium text-charcoal">&ldquo;{searchValue}&rdquo;</span>
            </p>
            {orderedDocs.length === 0 && (
              <a
                href="/shop"
                className="font-sans text-sm text-olive underline-offset-2 hover:underline"
              >
                Clear search
              </a>
            )}
          </div>
        )}

        {/* Empty state */}
        {orderedDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-serif text-2xl font-light text-charcoal">No products found</p>
            <p className="mt-2 font-sans text-sm text-warm-gray">
              {searchValue
                ? 'Try a different search term.'
                : 'Check back soon for new collections.'}
            </p>
          </div>
        )}

        {/* 4-column grid */}
        {orderedDocs.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
            {orderedDocs.map((product) => (
              <ProductGridItem key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Load more CTA */}
        {orderedDocs.length > 0 && products.totalDocs > orderedDocs.length && (
          <div className="mt-16 text-center">
            <button className="border border-warm-border px-10 py-4 font-sans text-sm tracking-[0.2em] uppercase text-charcoal transition-colors hover:border-olive hover:text-olive">
              Load More
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
