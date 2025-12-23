import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { ShopFilters } from '@/components/ShopFilters'
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
  const { q: searchValue, sort, category } = await searchParams
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
    ...(searchValue || categoryId
      ? {
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              ...(searchValue
                ? [
                    {
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
                    },
                  ]
                : []),
              ...(categoryId
                ? [
                    {
                      categories: {
                        contains: categoryId,
                      },
                    },
                  ]
                : []),
            ],
          },
        }
      : {}),
  })

  const resultsText = products.docs.length > 1 ? 'results' : 'result'

  return (
    <div className="pt-10 pb-20">
      <section className="border-b border-amber-100/80 bg-gradient-to-b from-amber-50/70 via-neutral-50 to-stone-50 dark:border-amber-900/40 dark:bg-gradient-to-b dark:from-neutral-950 dark:via-neutral-950 dark:to-stone-900/40">
        <div className="container space-y-4 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
            Shop
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-3xl">
                Tunisian ceramic tiles for every room.
              </h1>
              <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-300">
                Browse collections suitable for kitchens, bathrooms, floors, and more. Use search or
                filters to narrow down to the tiles that fit your project.
              </p>
            </div>

            <div className="text-xs text-neutral-600 dark:text-neutral-300">
              {searchValue ? (
                <p>
                  {products.docs?.length === 0
                    ? 'No tiles match '
                    : `Showing ${products.docs.length} ${resultsText} for `}
                  <span className="font-semibold">&quot;{searchValue}&quot;</span>
                </p>
              ) : (
                <p>{products.docs?.length || 0} tiles available</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 dark:bg-neutral-950/40">
        <div className="container py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            {/* Filters Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <ShopFilters categories={categories} />
            </aside>

            {/* Products Grid */}
            <div>
              {!searchValue && products.docs?.length === 0 && (
                <p className="rounded-xl border border-dashed border-amber-100 bg-white p-4 text-sm text-neutral-600 shadow-sm dark:border-amber-900/40 dark:bg-neutral-900 dark:text-neutral-300">
                  No tiles found yet. Try adjusting your search or check back soon for new collections.
                </p>
              )}

              {products?.docs.length > 0 ? (
                <Grid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.docs.map((product) => {
                    return <ProductGridItem key={product.id} product={product} />
                  })}
                </Grid>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
