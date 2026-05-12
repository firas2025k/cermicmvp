import type { Category, Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Gallery } from '@/components/product/Gallery'
import { ProductDescription } from '@/components/product/ProductDescription'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []
  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'
  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: { follow: canIndex, index: canIndex },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({ ...item, image: item.image as Media })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== 'object') return false
        return variant.inventory && variant?.inventory > 0
      })
    : product.inventory! > 0

  let price = product.priceInEUR
  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInEUR && acc && variant?.priceInEUR > acc) {
        return variant.priceInEUR
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'eur',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((p) => typeof p === 'object') ?? []

  // Derive first category label for breadcrumb and product info
  const firstCategory =
    (product.categories ?? []).find(
      (c): c is Category => typeof c === 'object' && c !== null,
    ) ?? null

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        type="application/ld+json"
      />

      <div className="bg-linen min-h-screen">
        {/* ── Breadcrumb ──────────────────────────────────────── */}
        <div className="container pt-8 lg:pt-10">
          <nav className="flex items-center gap-2 font-sans text-[11px] text-warm-gray">
            <Link href="/" className="transition-colors hover:text-charcoal">
              Home
            </Link>
            <span className="text-warm-border">/</span>
            {firstCategory ? (
              <Link href={`/shop?category=${firstCategory.slug ?? ''}`} className="transition-colors hover:text-charcoal">
                {firstCategory.title}
              </Link>
            ) : (
              <Link href="/shop" className="transition-colors hover:text-charcoal">
                Shop
              </Link>
            )}
            <span className="text-warm-border">/</span>
            <span className="text-charcoal">{product.title}</span>
          </nav>
        </div>

        {/* ── Two-column product layout ────────────────────────── */}
        <section className="container pb-16 pt-8 lg:pb-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: sticky gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Suspense
                fallback={
                  <div className="aspect-square w-full bg-[#EDE8DD]" />
                }
              >
                {Boolean(gallery?.length) && <Gallery gallery={gallery} />}
              </Suspense>
            </div>

            {/* Right: product info */}
            <div>
              <ProductDescription
                product={product}
                categoryLabel={firstCategory?.title ?? null}
              />
            </div>
          </div>
        </section>

        {/* ── Extra content blocks (CTA / content / media from CMS) ── */}
        {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : null}

        {/* ── You May Also Like ─────────────────────────────────── */}
        {relatedProducts.length > 0 ? (
          <RelatedProducts products={relatedProducts as Product[]} />
        ) : null}
      </div>
    </React.Fragment>
  )
}

// ── Related products section ─────────────────────────────────────────────────

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null

  // Prices are stored in cents — divide by 100 for display
  const formatEUR = (cents?: number | null) =>
    typeof cents === 'number'
      ? `€ ${(cents / 100).toFixed(2).replace('.', ',')}`
      : ''

  return (
    <section className="bg-linen border-t-2 border-charcoal">
      <div className="container py-16">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl font-light text-charcoal">
            You May Also Like
          </h2>
          <Link
            href="/shop"
            className="font-sans text-xs font-semibold tracking-[0.1em] uppercase text-charcoal underline underline-offset-4 transition-colors hover:text-olive"
          >
            View All →
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => {
            const galleryImage =
              product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
                ? (product.gallery[0].image as Media)
                : undefined
            const metaImg =
              product.meta?.image && typeof product.meta.image === 'object'
                ? (product.meta.image as Media)
                : undefined
            const image = galleryImage || metaImg

            const categoryLabel =
              (product.categories ?? []).find(
                (c): c is Category => typeof c === 'object' && c !== null,
              )?.title ?? null

            return (
              <li key={product.id} className="group bg-linen">
                <Link href={`/products/${product.slug}`} className="block">
                  {/* 3:4 image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#EDE8DD]">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={image.alt || product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    ) : null}
                    {/* Slide-up quick-add overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[rgba(248,244,238,0.96)] p-2.5 transition-transform duration-200 group-hover:translate-y-0">
                      <span className="block w-full bg-charcoal py-2.5 text-center font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-linen transition-colors hover:bg-terra">
                        View Product
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-4">
                    {categoryLabel && (
                      <p className="mb-1 font-sans text-[10px] font-bold tracking-[0.15em] uppercase text-warm-gray">
                        {categoryLabel}
                      </p>
                    )}
                    <p className="mb-1 font-serif text-base text-charcoal transition-colors group-hover:text-olive">
                      {product.title}
                    </p>
                    <p className="font-sans text-sm font-bold text-charcoal">
                      {formatEUR(product.priceInEUR)}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

// ── Data query ───────────────────────────────────────────────────────────────

const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      gallery: true,
      inventory: true,
      enableVariants: true,
      variantTypes: true,
      variants: true,
      priceInEUR: true,
      priceInEUREnabled: true,
      meta: true,
      layout: true,
      relatedProducts: true,
      categories: true,
    },
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variantTypes: { label: true, name: true, options: true },
      variants: {
        title: true,
        priceInEUR: true,
        priceInEUREnabled: true,
        inventory: true,
        options: true,
      },
      gallery: { populate: { variantOption: true } },
      relatedProducts: { populate: { gallery: true, meta: true } },
    } as any,
  })

  return result.docs?.[0] || null
}
