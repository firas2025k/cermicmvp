import Link from 'next/link'

// Reuse the dynamic metadata generation so the home page can still
// pick up title / SEO settings from the "home" document in Payload.
export { generateMetadata } from './[slug]/page'

export default function HomePage() {
  return (
    <div className="pt-24 pb-24">
      <HeroSection />
      <FeaturedCollectionsSection />
      <ApplicationsSection />
      <StorySection />
      <CraftSection />
      <InspirationSection />
      <SamplesSection />
      <FaqPreviewSection />
      <FinalCtaSection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="border-b border-neutral-200 bg-gradient-to-b from-amber-50 via-neutral-50 to-stone-50 dark:border-neutral-800 dark:bg-gradient-to-b dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container flex flex-col gap-10 py-12 md:flex-row md:items-center">
        <div className="max-w-xl space-y-6">
          <p className="text-sm font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
            Imported ceramic tiles from Tunisia
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 md:text-5xl">
            Tunisian ceramic tiles for warm, modern spaces.
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-300">
            Curated, small-batch tiles sourced from artisan workshops across Tunisia. Designed for
            kitchens, bathrooms, and entryways that feel calm, lived-in, and uniquely yours.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-amber-800 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-900 dark:bg-amber-300 dark:text-neutral-950 dark:hover:bg-amber-200"
            >
              Browse tile collections
            </Link>
            <Link
              href="/shop?view=samples"
              className="rounded-full border border-amber-200 px-6 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-white/70 dark:border-amber-400 dark:text-neutral-100 dark:hover:bg-neutral-900"
            >
              Order samples
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Small-batch · Hand-glazed · Made in Tunisia</span>
            <span className="hidden md:inline">/</span>
            <span>Suitable for kitchens, baths, and floors</span>
          </div>
        </div>

        <div className="relative mx-auto h-64 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-amber-100 via-amber-50 to-stone-100 shadow-sm dark:border-neutral-800 dark:from-amber-900/40 dark:via-neutral-900 dark:to-stone-900/40 md:h-80">
          <div className="absolute inset-6 grid grid-cols-3 grid-rows-3 gap-1 rounded-2xl bg-amber-50/80 p-1 dark:bg-neutral-900/80">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                // Static layout tiles purely for visual pattern
                key={index}
                className="rounded-md bg-gradient-to-br from-amber-200 via-amber-100 to-stone-200 dark:from-amber-700 dark:via-neutral-800 dark:to-stone-700"
              />
            ))}
          </div>
          <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm dark:bg-neutral-950/90 dark:text-neutral-100">
            Mediterranean-inspired palette
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedCollectionsSection() {
  const collections = [
    {
      name: 'Medina Subway',
      description: 'Matte 5×15 cm subway tiles with soft, hand-drawn edges.',
      usage: 'Ideal for kitchen backsplashes and shower walls.',
    },
    {
      name: 'Terracotta Atlas',
      description: 'Warm, natural terracotta with subtle tonal variation.',
      usage: 'Perfect for entryways, mudrooms, and living spaces.',
    },
    {
      name: 'Zellige Mosaic',
      description: 'Gloss, high-variation zellige-style tiles in curated tones.',
      usage: 'Statement walls, niches, and feature areas.',
    },
  ]

  return (
    <section className="border-b border-neutral-200 bg-gradient-to-b from-amber-50/60 via-white to-stone-50 dark:border-neutral-800 dark:bg-gradient-to-b dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container space-y-8 py-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Featured tile collections
            </h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-300">
              A curated starting point: three core collections that cover most kitchens, bathrooms,
              and feature walls.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-neutral-800 underline-offset-4 hover:underline dark:text-neutral-100"
          >
            View all tiles
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.name}
              className="flex flex-col rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:bg-amber-50/70 hover:shadow-md dark:border-amber-900/40 dark:bg-neutral-900/70 dark:hover:border-amber-700 dark:hover:bg-neutral-900"
            >
              <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-amber-100 via-amber-50 to-stone-200 dark:from-amber-800 dark:via-neutral-900 dark:to-stone-700" />
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                {collection.name}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                {collection.description}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {collection.usage}
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/shop"
                  className="text-xs font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50"
                >
                  View collection
                </Link>
                <Link
                  href="/shop?view=samples"
                  className="text-xs font-medium text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-300"
                >
                  Order sample
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ApplicationsSection() {
  const applications = [
    {
      label: 'Kitchens',
      description: 'Backsplashes and full-height walls that resist splashes and everyday wear.',
    },
    {
      label: 'Bathrooms & showers',
      description: 'Moisture-ready tiles for shower walls, niches, and sink backdrops.',
    },
    {
      label: 'Floors & entryways',
      description: 'Durable surfaces that handle foot traffic while staying easy to clean.',
    },
    {
      label: 'Outdoor & patios',
      description: 'Selected tiles that stand up to covered outdoor spaces and courtyards.',
    },
  ]

  return (
    <section className="border-b border-neutral-200 bg-gradient-to-b from-amber-50/40 via-neutral-50 to-stone-50 dark:border-neutral-800 dark:bg-gradient-to-b dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container space-y-8 py-16">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Designed for real rooms and real projects
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Browse by application to see tiles that are appropriate for the humidity, wear, and
            maintenance needs of each space.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {applications.map((app) => (
            <article
              key={app.label}
              className="flex flex-col justify-between rounded-2xl border border-dashed border-amber-100 bg-white/90 p-4 text-sm shadow-sm transition hover:border-solid hover:border-amber-300 dark:border-amber-900/50 dark:bg-neutral-900 dark:hover:border-amber-700"
            >
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  {app.label}
                </h3>
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
                  {app.description}
                </p>
              </div>
              <Link
                href="/shop"
                className="mt-3 text-xs font-medium text-neutral-800 underline-offset-4 hover:underline dark:text-neutral-100"
              >
                View tiles for {app.label.toLowerCase()}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function StorySection() {
  return (
    <section className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container grid gap-10 py-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Tiles sourced from Tunisian workshops, curated for your home.
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            We work directly with small, family-run ceramic studios across Tunisia to bring you
            tiles with real depth and character. Each collection is built around a considered color
            palette and finish that pairs easily with modern cabinetry, fixtures, and flooring.
          </p>
          <ul className="grid gap-2 text-sm text-neutral-700 dark:text-neutral-200 sm:grid-cols-2">
            <li>• Authentic Tunisian glazes and patterns</li>
            <li>• Small-batch runs with natural variation</li>
            <li>• Fired for durability in high-use spaces</li>
            <li>• Support for custom sizing on larger projects</li>
          </ul>
          <Link
            href="/shop"
            className="inline-flex text-sm font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50"
          >
            Learn more about our collections
          </Link>
        </div>

        <div className="h-56 rounded-3xl bg-gradient-to-br from-amber-100 via-amber-50 to-stone-100 shadow-sm dark:from-amber-900/50 dark:via-neutral-900 dark:to-stone-900/50 md:h-72">
          <div className="flex h-full items-end justify-between p-5">
            <div className="space-y-1 text-xs text-neutral-800 dark:text-neutral-50">
              <p className="font-semibold">Made in Tunisia</p>
              <p className="max-w-[14rem] text-neutral-700 dark:text-neutral-200">
                Each batch carries subtle differences in shade and texture—part of the charm of
                hand-finished ceramic tile.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/70 p-2 shadow-md dark:bg-neutral-900/80">
              <div className="h-10 w-10 rounded-md bg-amber-300" />
              <div className="h-10 w-10 rounded-md bg-sky-300" />
              <div className="h-10 w-10 rounded-md bg-neutral-300" />
              <div className="h-10 w-10 rounded-md bg-emerald-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CraftSection() {
  return (
    <section className="border-b border-neutral-200 bg-gradient-to-b from-amber-50/40 via-neutral-50 to-stone-50 dark:border-neutral-800 dark:bg-gradient-to-b dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container grid gap-10 py-16 md:grid-cols-2 md:items-start">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Craft, materials, and everyday performance.
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Behind every collection is a specific clay body, glaze recipe, and firing schedule. We
            translate the technical details into simple guidance so you always know where a tile
            works best.
          </p>
          <dl className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
            <div>
              <dt className="font-medium">Surfaces &amp; finishes</dt>
              <dd className="mt-1 text-xs">
                Choose from matte, satin, gloss, and textured surfaces depending on how much light
                and movement you want.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Suitability</dt>
              <dd className="mt-1 text-xs">
                Clear guidance on which tiles are best for walls, floors, wet rooms, and covered
                outdoor areas.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Care &amp; maintenance</dt>
              <dd className="mt-1 text-xs">
                Straightforward cleaning and sealing recommendations so your tiles age gracefully.
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 rounded-3xl border border-dashed border-amber-100 bg-white p-5 text-xs text-neutral-600 shadow-sm dark:border-amber-900/50 dark:bg-neutral-900 dark:text-neutral-300">
          <p className="font-medium text-neutral-800 dark:text-neutral-100">
            Quick spec snapshot (example)
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li>
              <p className="text-[0.7rem] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Water absorption
              </p>
              <p>Low-porosity tiles suitable for kitchens and most baths.</p>
            </li>
            <li>
              <p className="text-[0.7rem] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Slip resistance
              </p>
              <p>Recommended finishes for floors and entry areas.</p>
            </li>
            <li>
              <p className="text-[0.7rem] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Variation
              </p>
              <p>Intentional shade and surface variation for a more organic look.</p>
            </li>
            <li>
              <p className="text-[0.7rem] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Formats
              </p>
              <p>Common sizes plus support for custom cuts on larger orders.</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function InspirationSection() {
  const projects = [
    {
      label: 'Rental kitchen refresh',
      description: 'Warm subway tiles that transform a small kitchen without a full gut.',
    },
    {
      label: 'Shower niche & walls',
      description: 'Gloss zellige-style tiles that bounce light in compact bathrooms.',
    },
    {
      label: 'Entryway floor',
      description: 'Durable terracotta underfoot with just enough variation to hide everyday life.',
    },
  ]

  return (
    <section className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container space-y-8 py-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Real spaces, tiled with care.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-300">
              A small gallery of projects to help you picture how Tunisian tiles can live in your
              own home.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.label}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60"
            >
              <div className="mb-3 h-32 rounded-xl bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-600" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                {project.label}
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">
                {project.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SamplesSection() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40">
      <div className="container py-16">
        <div className="grid gap-8 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Order samples before you commit.
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              See the color, variation, and finish in your own light. Build a small palette for your
              project and live with it for a few days before finalizing your order.
            </p>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
              <li>• Choose samples from any collection.</li>
              <li>• Fast shipping with clear tracking.</li>
              <li>• Sample cost can be credited towards a full order (optional note).</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop?view=samples"
                className="rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                Order tile samples
              </Link>
              <Link
                href="/shop"
                className="rounded-full border border-neutral-300 px-6 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-white/70 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
              >
                Browse collections
              </Link>
            </div>
          </div>

          <div className="h-40 rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-stone-100 p-3 shadow-inner dark:from-amber-900/40 dark:via-neutral-900 dark:to-stone-900/40">
            <div className="flex h-full items-center justify-center gap-2">
              <div className="h-20 w-20 rounded-md bg-neutral-300 shadow-sm dark:bg-neutral-600" />
              <div className="h-20 w-20 -translate-y-3 rounded-md bg-amber-300 shadow-md dark:bg-amber-500" />
              <div className="h-20 w-20 rounded-md bg-sky-200 shadow-sm dark:bg-sky-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqPreviewSection() {
  const faqs = [
    {
      q: 'Can I use these tiles in a shower?',
      a: 'Yes—many collections are suitable for wet areas. Each product clearly lists where it can be used.',
    },
    {
      q: 'Are any tiles safe for floors?',
      a: 'Selected matte and textured finishes are recommended for floors and entryways.',
    },
    {
      q: 'How do I know how many tiles to order?',
      a: 'We provide simple coverage guidance and recommend ordering 10–15% extra for cuts and waste.',
    },
  ]

  return (
    <section className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container grid gap-10 py-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Questions before you tile?
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            A few essentials to get you started. We&apos;ll keep the details in plain language so
            you don&apos;t need to be a contractor to make confident decisions.
          </p>

          <div className="mt-6 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 text-sm transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {item.q}
                  </span>
                  <span className="text-xs text-neutral-500 group-open:hidden dark:text-neutral-400">
                    +
                  </span>
                  <span className="hidden text-xs text-neutral-500 group-open:inline dark:text-neutral-400">
                    –
                  </span>
                </summary>
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-300">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
          <p className="font-medium">Planning a bigger project?</p>
          <p className="text-xs">
            For full-home renovations or commercial spaces, we can help you select tile mixes,
            estimate quantities, and coordinate lead times from Tunisia.
          </p>
          <Link
            href="/shop"
            className="inline-flex text-xs font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50"
          >
            Start with a few collections
          </Link>
        </div>
      </div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="bg-gradient-to-r from-amber-900 via-neutral-900 to-stone-900 text-neutral-50">
      <div className="container flex flex-col items-start justify-between gap-4 py-10 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Ready to start your tile project?</h2>
          <p className="mt-2 text-sm text-neutral-300">
            Build a palette that feels like home—then tile once, and tile right.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-neutral-50 px-6 py-2.5 text-xs font-medium text-neutral-900 shadow-sm transition hover:bg-white"
          >
            Browse all tiles
          </Link>
          <Link
            href="/shop?view=samples"
            className="rounded-full border border-neutral-500 px-6 py-2.5 text-xs font-medium text-neutral-50 transition hover:bg-neutral-800"
          >
            Order samples
          </Link>
        </div>
      </div>
    </section>
  )
}
