# Implementation prompt: SEO foundations for Nabea production

**Status:** implemented (phase 1)  
**Date:** 2026-09-03  
**Skill:** `.agents/skills/nextjs-seo-audit/` (orchestrator + technical, meta, schema, international)

## Goal

Make `nabea.at` discoverable by Google and AI assistants before production by fixing technical SEO foundations: brand identity in metadata, crawlability (robots + sitemap), canonical URLs, German language signal, and valid structured data.

This pass is **phase 1 (technical foundations)**. It does **not** rewrite all marketing copy page-by-page, add hreflang for EN, or invent a logo asset.

## Confirmed decisions

| Decision | Value |
|---|---|
| Domain | `https://nabea.at` |
| Brand (consumer-facing) | `Nabea` |
| Legal company name | `NABEA e.U.` |
| Language | German only (`lang="de"`) |
| Country | Austria |
| City (existing copy) | Wien |
| Contact email (existing) | `hello@nabea.at` |
| Instagram | `https://www.instagram.com/nabea.at/` (tracking query stripped) |
| Logo URL | Not available yet — omit `logo` in Organization schema until provided; use a temporary default OG image strategy (see below) |
| Scope | Phase 1 technical foundations + sensible German defaults where template English remains |

## Inspected code

- `src/app/(app)/layout.tsx` — root `metadata` export commented out; `html lang="en"`
- `src/app/(app)/robots.ts` — allows all; base URL from `NEXT_PUBLIC_VERCEL_URL`; points at missing sitemap
- No `src/app/(app)/sitemap.ts` (or equivalent)
- `src/utilities/generateMeta.ts` — fallback title still “Payload Ecommerce Template”; relative OG URLs; no canonicals
- `src/utilities/mergeOpenGraph.ts` — Payload template defaults and Payload OG image
- `src/utilities/getURL.ts` — `NEXT_PUBLIC_SERVER_URL` helper
- `src/plugins/index.ts` — SEO plugin title suffix and product URL path wrong (`/{slug}` instead of `/products/{slug}`)
- `src/app/(app)/products/[slug]/page.tsx` — Product JSON-LD present but incomplete/incorrect
- `src/app/(app)/shop/page.tsx` — static German shop meta only
- Payload SEO fields exist on Pages + Products; not on Categories / Homepage global
- Breadcrumbs and FAQ UI exist; no BreadcrumbList / FAQPage schema yet (phase 2)

## Decisions and assumptions

1. **Canonical host:** Prefer `https://nabea.at` (non-www) everywhere (`metadataBase`, sitemap, robots, schema `url`). If production already forces `www`, align env + redirects later — do not invent a www/non-www redirect in this pass unless one already exists.
2. **Env:** Production `NEXT_PUBLIC_SERVER_URL` should be `https://nabea.at`. Code should prefer `NEXT_PUBLIC_SERVER_URL` over Vercel preview host for SEO absolute URLs. Update `.env.example` placeholders only (never commit secrets).
3. **Default OG image without logo:** Until a brand OG/logo asset exists, keep a **neutral fallback** (prefer an existing public site image if one is suitable; otherwise omit image from defaults rather than keep the Payload CMS OG image). Do not invent a fake logo URL.
4. **Private routes:** Set `robots: { index: false, follow: false }` (or equivalent) on cart, checkout, account, orders, login, create-account, forgot/reset password, logout, newsletter confirm flows. Disallow `/admin`, `/api`, and preview paths in `robots.ts` where appropriate.
5. **Sitemap contents:** Published Pages (including home as `/`), published Products (`/products/{slug}`), and key static public routes (`/shop`, inquiry/legal slugs if they are CMS pages). Exclude drafts, admin, account, checkout, cart.
6. **Product JSON-LD fixes:** Plain-text description; absolute image URL; absolute product URL; EUR price in major units (not cents); `brand: Nabea`; availability; keep AggregateOffer or Offer consistent with actual pricing model.
7. **Organization + WebSite JSON-LD:** Add once in root layout (or a small shared server component). Use legal name `NABEA e.U.` as Organization `name` (and `legalName` if both are set), with consumer brand `Nabea` as `alternateName` where useful. Include url `https://nabea.at`, `addressCountry: AT`, `sameAs: [Instagram]`, contact point email if appropriate. No `logo` until provided. WebSite `name` can stay consumer-facing `Nabea`.
8. **German defaults:** Replace remaining “Payload Ecommerce Template” / English template OG strings with Nabea German defaults. Do not silently rewrite approved marketing copy beyond template leftovers and missing defaults.
9. **Out of scope this pass:** Category SEO fields, FAQPage/BreadcrumbList schema, EN locale/hreflang, inventing logo/OG artwork, Search Console verification meta (unless user provides a code), content keyword rewriting.

## Files expected to touch

- `src/app/(app)/layout.tsx` — restore metadata (`metadataBase`, title template, defaults), `lang="de"`, Organization/WebSite JSON-LD
- `src/app/(app)/robots.ts` — absolute host from `getServerSideURL` / `NEXT_PUBLIC_SERVER_URL`, disallow private paths, sitemap URL
- `src/app/(app)/sitemap.ts` — **new** dynamic sitemap
- `src/utilities/mergeOpenGraph.ts` — Nabea defaults
- `src/utilities/generateMeta.ts` — branded fallbacks, absolute URLs, canonicals
- `src/utilities/getURL.ts` — only if needed for consistent absolute URL behavior
- `src/plugins/index.ts` — SEO plugin title `| Nabea`, correct product vs page URLs
- `src/app/(app)/products/[slug]/page.tsx` — fix Product JSON-LD + product metadata/canonical
- Possibly small metadata updates on shop / auth pages for `noindex` or German titles
- `.env.example` — document `NEXT_PUBLIC_SERVER_URL=https://nabea.at`, `NEXT_PUBLIC_SITE_NAME=Nabea`
- `AGENTS.md` — short note to use `.agents/skills/nextjs-seo-audit/` for SEO work and prefer metadata/CMS sources over raw HTML only
- Optional helper: `src/utilities/generateJsonLd.ts` or similar if it keeps layout/product pages clean

## Security / safety

- No secrets in code or docs.
- Do not index authenticated or checkout flows.
- Do not expose draft/unpublished products or pages in sitemap or public JSON-LD.
- Validate that media URLs used in OG/schema are absolute and public.

## Acceptance criteria

1. Viewing page source / Next metadata on `/` shows Nabea branding, German `lang`, and no “Payload Ecommerce Template”.
2. `/robots.txt` references `https://nabea.at/sitemap.xml` (or env-based absolute equivalent) and disallows admin/private areas.
3. `/sitemap.xml` lists published homepage, CMS pages, shop, and products with absolute URLs.
4. Product pages emit valid-looking Product JSON-LD (plain description, EUR amount, brand, url, image, availability).
5. Site emits Organization + WebSite JSON-LD with legal name `NABEA e.U.`, Instagram `sameAs`, and no broken logo URL.
6. Public pages have sensible title/description/OG defaults; private pages are `noindex`.
7. SEO plugin admin title/URL helpers use Nabea and correct product paths.
8. Lint/typecheck clean for touched files; no Neon migration required.

## Checks to run

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Manual:

1. Open `/`, `/shop`, one product, one CMS page — check `<title>`, meta description, OG tags, canonical.
2. Open `/robots.txt` and `/sitemap.xml`.
3. Validate Product + Organization JSON-LD in page source (and optionally Google Rich Results Test after deploy).
4. Confirm cart/checkout/account pages include noindex.

## Manual test steps (post-implement)

1. Set local `NEXT_PUBLIC_SERVER_URL=http://localhost:3000` and confirm absolute URLs still build correctly.
2. Confirm production env will use `NEXT_PUBLIC_SERVER_URL=https://nabea.at` and `NEXT_PUBLIC_SITE_NAME=Nabea`.
3. After deploy: submit sitemap in Google Search Console (user action).
4. When logo/OG image is ready: add Organization `logo` + default OG image in one small follow-up.

## Needs from user after approval (not blockers for coding)

- Confirm non-www `https://nabea.at` is the final canonical host.
- Provide logo and/or default social OG image URL when available.
- Optional: Google Search Console verification code when ready.

## Phase 2 (later, separate prompt)

- BreadcrumbList + FAQPage schema
- Category landing SEO (if category URLs are promoted beyond query params)
- Homepage/global SEO fields if Homepage global should own home meta
- Image SEO / Core Web Vitals pass
- Search Console + Bing / AI crawler monitoring
*** End Patch
