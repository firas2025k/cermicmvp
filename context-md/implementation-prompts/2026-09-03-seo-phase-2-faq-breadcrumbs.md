# Implementation prompt: SEO phase 2 (FAQ + breadcrumbs)

**Status:** implemented  
**Date:** 2026-09-03  
**Depends on:** phase 1 foundations (`2026-09-03-seo-foundations.md`)  
**Skill:** `.agents/skills/nextjs-seo-audit/` (schema-json-optimization, on-page)

## Goal

Improve Google rich-result eligibility and AI citation clarity on product pages by adding **BreadcrumbList** and **FAQPage** JSON-LD that mirror content already shown in the UI. Keep shop categories as **filters only** (no new category landing routes). Defer logo / default OG image until assets exist.

## Confirmed decisions

| Decision | Value |
|---|---|
| Category SEO | Keep `/shop?category=…` filters only — **no** dedicated category landing pages |
| Logo / default OG image | **Blocked** until user uploads assets (follow-up after this pass) |
| Scope | Product BreadcrumbList + FAQPage schema; reuse phase-1 helpers |
| Language / brand | Unchanged from phase 1 (German, Nabea / NABEA e.U., `https://nabea.at`) |

## Inspected code

- Product breadcrumbs (UI only): `src/app/(app)/products/[slug]/page.tsx` — Startseite → category or Shop → product title
- Product FAQs: `src/components/product/ProductFAQ.tsx` — `product.faqItems` or static care/shipping accordion; description accordion
- General FAQ block: `src/components/product/GeneralProductFaq.tsx` + global `product-faq-section`
- Phase-1 helpers: `lexicalToPlainText`, `absoluteUrl`, `siteJsonLd`, Product JSON-LD already on product page
- Shop remains `src/app/(app)/shop/page.tsx` with query-param category filters

## Decisions and assumptions

1. **BreadcrumbList** on every product page, matching visible trail:
   - Home → `/` (“Startseite”)
   - If first category exists → `/shop?category={slug}` with category title; else Shop → `/shop`
   - Current product → `/products/{slug}` (no link needed in schema as last item)
2. **FAQPage** only when there is real Q&A content to emit:
   - Prefer CMS `product.faqItems` (question = title, answer = plain text from Lexical/string)
   - Include general FAQ global items when `showGeneralFaq` is enabled and items exist
   - Include static care/shipping accordion items only if they are actually rendered as FAQ rows for that product (same source as `ProductFAQ`)
   - Skip empty FAQ schema rather than inventing Q&As
   - Answers must be plain text (use `lexicalToPlainText`); never dump Lexical JSON
3. Emit BreadcrumbList + FAQPage as **additional** `<script type="application/ld+json">` blocks beside existing Product schema (or one `@graph` if cleaner — prefer separate scripts matching current Product pattern for minimal churn).
4. **No** new routes, **no** Categories SEO fields, **no** Homepage-global meta ownership change, **no** logo/OG wiring in this pass.
5. Do not change visible UI copy or accordion behavior — schema only mirrors existing content.

## Files expected to touch

- `src/utilities/productJsonLd.ts` (new) — helpers to build BreadcrumbList + FAQPage from product + optional general FAQ
- `src/app/(app)/products/[slug]/page.tsx` — wire helpers next to existing Product JSON-LD
- Possibly small reuse of `lexicalToPlainText` / `absoluteUrl` only
- Update this prompt status when implemented

## Out of scope

- Category landing pages / category CMS SEO fields
- Logo + default OG image (wait for upload)
- FAQPage on non-product pages
- Core Web Vitals / image performance pass
- Search Console verification codes
- Changing shop URL structure

## Acceptance criteria

1. Product page source includes valid BreadcrumbList JSON-LD matching the on-page breadcrumb labels and URLs.
2. When FAQs are shown, page source includes FAQPage JSON-LD with plain-text questions/answers from the same sources as the UI.
3. When a product has no FAQ content, no empty/fake FAQPage block is emitted.
4. Existing Product + Organization/WebSite schema from phase 1 still present and unchanged in intent.
5. Shop category behavior unchanged (filters only).
6. Lint clean for touched files; no DB migration.

## Checks

```bash
pnpm exec tsc --noEmit
pnpm lint
```

Manual:

1. Open a product with category + FAQs — view source / Rich Results style check for BreadcrumbList + FAQPage + Product.
2. Open a product without general FAQ / without custom faqItems — confirm BreadcrumbList still present; FAQPage only if static FAQ rows render.
3. Confirm `/shop?category=…` still works as a filter (no new routes).

## Follow-up (separate, when assets ready)

- Add Organization `logo`
- Add default Open Graph image in `mergeOpenGraph` / root metadata
- Optional: Search Console verification meta

## Needs from user after approval

- None to start coding.
- Later: logo URL and/or default social OG image URL when available.
