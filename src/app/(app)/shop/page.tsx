import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata = {
  title: 'Shop tiles',
  description: 'Browse Tunisian ceramic tile collections for kitchens, bathrooms, floors, and more.',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category, minPrice, maxPrice } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Fetch categories for filters with parent relationships
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
    depth: 1, // Fetch parent relationships
  })
  const categories = categoriesResult.docs || []

  // Find category by slug if category filter is provided
  let categoryId: number | undefined
  if (category) {
    const categorySlug = typeof category === 'string' ? category : category[0]
    const foundCategory = categories.find((cat) => cat.slug === categorySlug)
    if (foundCategory && typeof foundCategory.id === 'number') {
      categoryId = foundCategory.id
    }
  }

  // Parse price filters
  const minPriceNum = minPrice ? parseFloat(String(minPrice)) : null
  const maxPriceNum = maxPrice ? parseFloat(String(maxPrice)) : null

  // Build where conditions
  const whereConditions: any[] = [
    {
      _status: {
        equals: 'published',
      },
    },
  ]

  // Add search filter
  if (searchValue) {
    whereConditions.push({
      or: [
        {
          title: {
            like: searchValue,
          },
        },
        {
          description: {
            like: searchValue,
          },
        },
      ],
    })
  }

  // Add category filter
  if (categoryId) {
    whereConditions.push({
      categories: {
        contains: categoryId,
      },
    })
  }

  // Add price range filter
  if (minPriceNum !== null || maxPriceNum !== null) {
    const priceCondition: any = {}
    
    if (minPriceNum !== null) {
      priceCondition.greater_than_equal = minPriceNum
    }
    
    if (maxPriceNum !== null) {
      priceCondition.less_than_equal = maxPriceNum
    }

    whereConditions.push({
      priceInEUR: priceCondition,
    })
  }

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInEUR: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    where: {
      and: whereConditions,
    },
  })

  const resultsText = products.docs.length > 1 ? 'results' : 'result'

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Hero Section */}
      <section className="border-b border-neutral-200/60 bg-gradient-to-br from-amber-50/50 via-white to-stone-50/30 dark:border-neutral-800/60 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="container space-y-6 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Shop
          </div>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-4xl lg:text-5xl">
                Tunisian ceramic tiles for every room.
              </h1>
              <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400 md:text-lg">
                Browse collections suitable for kitchens, bathrooms, floors, and more. Use search or
                filters to narrow down to the tiles that fit your project.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-neutral-200/60 bg-white/80 px-4 py-2.5 shadow-sm dark:border-neutral-800/60 dark:bg-neutral-900/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {products.docs?.length || 0}
                </span>
              </div>
              <div className="text-sm">
                {searchValue ? (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {products.docs?.length === 0
                      ? 'No tiles match '
                      : `Showing ${products.docs.length} ${resultsText} for `}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">&quot;{searchValue}&quot;</span>
                  </p>
                ) : (
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">
                    {products.docs?.length || 0} {products.docs?.length === 1 ? 'tile' : 'tiles'} available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-8 md:py-12">
        <div className="w-full">
          {/* Products Grid */}
          <div className="min-h-[400px]">
            {!searchValue && products.docs?.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  No tiles found yet
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Try adjusting your search or check back soon for new collections.
                </p>
              </div>
            )}

            {products?.docs.length > 0 ? (
              <Grid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {products.docs.map((product) => {
                  return <ProductGridItem key={product.id} product={product} />
                })}
              </Grid>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
