import { Grid } from '@/components/Grid'
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
    limit: 100,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInEUR: true,
      inventory: true,
    },
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sticky filter bar */}
      <Suspense fallback={<div className="h-[52px] border-b border-neutral-100 bg-white" />}>
        <ShopFilterBar
          topLevel={topLevel}
          byParent={byParent}
          activeCategory={activeCategory}
          activeSort={activeSort}
        />
      </Suspense>

      {/* Product grid */}
      <section className="container py-8">
        {/* Result count + search feedback */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {searchValue ? (
              <>
                {orderedDocs.length === 0 ? 'Keine' : orderedDocs.length}{' '}
                {orderedDocs.length === 1 ? 'Ergebnis' : 'Ergebnisse'} für{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                  &quot;{searchValue}&quot;
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {orderedDocs.length}
                </span>{' '}
                {orderedDocs.length === 1 ? 'Produkt' : 'Produkte'}
              </>
            )}
          </p>

          {searchValue && orderedDocs.length === 0 && (
            <a
              href="/shop"
              className="text-sm font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
            >
              Alle anzeigen
            </a>
          )}
        </div>

        {/* Empty states */}
        {orderedDocs.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white py-24 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Keine Produkte gefunden
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {searchValue
                ? 'Versuche einen anderen Suchbegriff.'
                : 'Schau bald wieder vorbei für neue Kollektionen.'}
            </p>
          </div>
        )}

        {/* 4-column product grid */}
        {orderedDocs.length > 0 && (
          <Grid className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {orderedDocs.map((product) => (
              <ProductGridItem key={product.id} product={product} />
            ))}
          </Grid>
        )}
      </section>
    </div>
  )
}
