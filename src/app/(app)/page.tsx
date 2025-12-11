import { RenderHomepageBlocks } from '@/blocks/RenderHomepageBlocks'
import { HeroCarousel } from '@/components/HeroCarousel'
import { Media } from '@/components/Media'
import { ProductCarousel } from '@/components/ProductCarousel'
import type { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

// Reuse the dynamic metadata generation so the home page can still
// pick up title / SEO settings from the "home" document in Payload.
export { generateMetadata } from './[slug]/page'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  // Try to fetch homepage from Global
  // Note: Types will be generated when Payload starts - run `pnpm payload generate:types` if needed
  let homepage: any = null
  try {
    homepage = await payload.findGlobal({
      slug: 'homepage' as any,
      depth: 2,
    } as any)
  } catch (error) {
    // Global might not exist yet, fall back to hardcoded content
    console.log('Homepage Global not found, using hardcoded content')
  }

  // If homepage Global exists and has layout blocks, use them
  if (
    homepage &&
    homepage.layout &&
    Array.isArray(homepage.layout) &&
    homepage.layout.length > 0 &&
    homepage._status === 'published'
  ) {
    return (
      <div className="pt-0">
        <RenderHomepageBlocks blocks={homepage.layout} />
      </div>
    )
  }

  // Fallback to hardcoded content (for backward compatibility)
  // Fetch featured products for different sections
  const [newArrivalsResult, bestsellersResult, topProductsResult] = await Promise.all([
    // New Arrivals - most recently created
    payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      limit: 8,
      sort: '-createdAt',
      depth: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        gallery: true,
        priceInEUR: true,
        categories: true,
        enableVariants: true,
      },
      populate: {
        variants: {
          title: true,
          priceInEUR: true,
          inventory: true,
        },
      },
    }),
    // Bestsellers
    payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      limit: 8,
      sort: '-createdAt',
      depth: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        gallery: true,
        priceInEUR: true,
        categories: true,
        enableVariants: true,
      },
      populate: {
        variants: {
          title: true,
          priceInEUR: true,
          inventory: true,
        },
      },
    }),
    // Top Products
    payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      limit: 8,
      sort: '-createdAt',
      depth: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        gallery: true,
        priceInEUR: true,
        categories: true,
        enableVariants: true,
      },
      populate: {
        variants: {
          title: true,
          priceInEUR: true,
          inventory: true,
        },
      },
    }),
  ])

  const newArrivals = newArrivalsResult.docs as Partial<Product>[]
  const bestsellers = bestsellersResult.docs as Partial<Product>[]
  const topProducts = topProductsResult.docs as Partial<Product>[]

  // Create hero slides using high-quality 4K images from public/media
  const heroSlides = [
    {
      id: '1',
      image: '/media/Arena-gtis-4K.webp',
      title: 'Mediterranean Tiles',
      subtitle: 'Für mehr Genuss & Glamour in deine mediterrane Weltküche',
      buttonText: 'Jetzt entdecken',
      buttonLink: '/shop',
    },
    {
      id: '2',
      image: '/media/Kitchen_PERLATO.webp',
      title: 'Premium Quality Ceramics',
      subtitle: 'Transform your space with elegance',
      buttonText: 'View Collection',
      buttonLink: '/shop',
    },
    {
      id: '3',
      image: '/media/Diva-4K.webp',
      title: 'Handcrafted Excellence',
      subtitle: 'Unique designs for modern homes',
      buttonText: 'Explore Now',
      buttonLink: '/shop',
    },
  ]

  return (
    <div className="pt-0">
      {/* Hero Carousel */}
      {heroSlides.length > 0 && <HeroCarousel slides={heroSlides} />}

      {/* Three Circular Feature Images */}
      <FeatureCirclesSection />

      {/* Products You Will Love */}
      {topProducts.length > 0 && (
        <ProductCarousel products={topProducts} title="PRODUKTE, DIE DU LIEBEN WIRST" limit={4} />
      )}

      {/* Small Media Mentions/Partner Logos */}
      <MediaMentionsSection />

      {/* Large Partner Logos with Rating */}
      <PartnerLogosSection />

      {/* Customer Reviews/Lifestyle Videos */}
      <CustomerReviewsSection />

      {/* Category Banner: Cutting Boards */}
      <CategoryBannerSection
        title="SCHNEIDEN, SERVIEREN & ANRICHTEN"
        subtitle="Deine neue Lieblings-Schneidebrett"
        products={newArrivals.slice(0, 4)}
      />

      {/* Category Products: Cutting Boards */}
      {newArrivals.length > 0 && (
        <ProductCarousel
          products={newArrivals.slice(0, 4)}
          title="SCHNEIDEN, SERVIEREN & ANRICHTEN"
          limit={4}
        />
      )}

      {/* Category Banner: Kitchen Utensils */}
      <CategoryBannerSection
        title="OLIVENHOLZ KOCHUTENSILIEN"
        subtitle="Live, Love & Cook"
        products={bestsellers.slice(0, 4)}
      />

      {/* Category Products: Kitchen Utensils */}
      {bestsellers.length > 0 && (
        <ProductCarousel
          products={bestsellers.slice(0, 4)}
          title="OLIVENHOLZ KOCHUTENSILIEN"
          limit={4}
        />
      )}

      {/* Brand Story Section */}
      <BrandStorySection />

      {/* Product Usage/Lifestyle Images */}
      <ProductUsageSection />

      {/* About Us Section */}
      <AboutUsSection />
    </div>
  )
}

function FeatureCirclesSection() {
  const features = [
    {
      label: 'Geschenk',
      description: 'Perfekt verpackt',
      image: '/media/Cedar-C-600x600.webp',
    },
    {
      label: 'Lieferung',
      description: 'Schnell & sicher',
      image: '/media/Himalaya-C-600x600.webp',
    },
    {
      label: 'Qualität',
      description: 'Handgefertigt',
      image: '/media/Rocher-C-600x600.webp',
    },
  ]

  return (
    <section className="border-b border-neutral-200 bg-gradient-to-b from-red-900/95 via-red-800/90 to-red-900/95 py-12 dark:border-neutral-800">
      <div className="container">
        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-32 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-sm shadow-xl overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-white">{feature.label}</h3>
                <p className="mt-1 text-xs text-red-100">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MediaMentionsSection() {
  const mediaOutlets = ['NBC', 'CBS', 'The New York Times', 'Fox News', "Women's Health"]

  return (
    <section className="border-b border-neutral-200 bg-neutral-50 py-8 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
          {mediaOutlets.map((outlet, index) => (
            <span key={index} className="hover:text-neutral-700 dark:hover:text-neutral-300">
              {outlet}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnerLogosSection() {
  const partners = ['OTTO', 'Genuss', 'Kaufland', 'TRENDSET', 'Lidl']

  return (
    <section className="border-b border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex h-16 items-center justify-center text-xl font-semibold text-neutral-400 transition hover:text-neutral-600 dark:text-neutral-600 dark:hover:text-neutral-400"
            >
              {partner}
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomerReviewsSection() {
  const reviews = [
    {
      title: 'Perfekte Qualität',
      rating: 5,
      image: '/media/Kitchen_PERLATO.webp',
    },
    {
      title: 'Schnelle Lieferung',
      rating: 5,
      image: '/media/Jasmin-4K.webp',
    },
    {
      title: 'Wunderschöne Tiles',
      rating: 5,
      image: '/media/Sandra4K.webp',
    },
    {
      title: 'Sehr zufrieden',
      rating: 5,
      image: '/media/Berlin-4K.webp',
    },
  ]

  return (
    <section className="border-b border-neutral-200 bg-white py-16 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Kundenbewertungen
          </h2>
          <button className="text-sm font-medium text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-400">
            Alle ansehen
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
            >
              <img
                src={review.image}
                alt={review.title}
                className="h-full w-full object-cover"
              />
              {/* Overlay with rating */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-center w-full">
                  <div className="mb-2 flex items-center justify-center gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-white">{review.title}</p>
                </div>
              </div>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 bg-black/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <svg
                    className="h-8 w-8 text-neutral-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l6.893-4.158a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryBannerSection({
  title,
  subtitle,
  products,
}: {
  title: string
  subtitle: string
  products: Partial<Product>[]
}) {
  return (
    <section className="border-b border-neutral-200 bg-gradient-to-br from-amber-50 via-neutral-50 to-stone-50 py-20 dark:border-neutral-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((product, index) => {
              const image =
                product.gallery?.[0]?.image && typeof product.gallery[0]?.image !== 'string'
                  ? product.gallery[0].image
                  : null

              return (
                <div
                  key={product.id || index}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg dark:from-amber-900/40 dark:to-amber-800/40"
                >
                  {image ? (
                    <Media
                      className="h-full w-full object-cover"
                      resource={image}
                      width={400}
                      height={400}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-neutral-900">
            <h2 className="text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-3xl">
              {title}
            </h2>
            <p className="text-center text-lg text-neutral-600 dark:text-neutral-300">{subtitle}</p>
            <Link
              href="/shop"
              className="rounded-full bg-amber-800 px-8 py-3 text-base font-medium text-white shadow-lg transition hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              Jetzt entdecken
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function BrandStorySection() {
  return (
    <section className="relative border-b border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/media/Ext-atlas-beige.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-stone-50 opacity-50 dark:from-amber-900/20 dark:to-neutral-900" />
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-12 text-center shadow-xl dark:bg-neutral-900">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Über unsere Tiles
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            Unsere handgefertigten Keramikfliesen aus Tunesien vereinen traditionelle Handwerkskunst
            mit modernem Design. Jede Fliese wird mit Sorgfalt hergestellt und trägt die
            charakteristischen Merkmale mediterraner Ästhetik. Haltbar, hygienisch und von
            zeitloser Schönheit – unsere Tiles sind die perfekte Wahl für Küchen, Bäder und
            Wohnräume.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full bg-amber-800 px-8 py-3 text-base font-medium text-white shadow-lg transition hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            Mehr erfahren
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProductUsageSection() {
  const usages = [
    {
      title: 'Steak auf Tiles',
      description: 'Perfekt serviert mit Wein',
      image: '/media/Hilton-4K.webp',
    },
    {
      title: 'Coasters & Töpfe',
      description: 'Stilvolle Accessoires',
      image: '/media/Ringo4K.webp',
    },
    {
      title: 'Schneiden & Servieren',
      description: 'Für jeden Anlass',
      image: '/media/Oceano-verde-4K_1_1.webp',
    },
  ]

  return (
    <section className="border-b border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-3">
          {usages.map((usage, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
            >
              <img
                src={usage.image}
                alt={usage.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">{usage.title}</h3>
                <p className="text-sm text-white/90 mb-4">{usage.description}</p>
                <Link
                  href="/shop"
                  className="inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  Mehr erfahren
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutUsSection() {
  return (
    <section className="border-b border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <img
              src="/media/Banniere-1200x900-1.jpg.jpeg"
              alt="Unser Team"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
              <p className="text-sm font-medium text-white">Unser Team</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Über uns
            </h2>
            <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
              Wir sind leidenschaftlich darin, die schönsten handgefertigten Keramikfliesen aus
              Tunesien nach Europa zu bringen. Unser Team arbeitet direkt mit lokalen Handwerkern
              zusammen, um sicherzustellen, dass jede Fliese die höchsten Qualitätsstandards erfüllt.
              Wir glauben an nachhaltige Produktion, faire Arbeitsbedingungen und die Bewahrung
              traditioneller Handwerkstechniken.
            </p>
            <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
              Unsere Mission ist es, mediterrane Eleganz in jedes Zuhause zu bringen und gleichzeitig
              die reiche Handwerkskultur Tunesiens zu unterstützen.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
