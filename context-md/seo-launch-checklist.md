# Nabea SEO — post-deploy checklist

## 1. Env

- [ ] Vercel production `NEXT_PUBLIC_SERVER_URL=https://www.nabea.at`
- [ ] Vercel production `PAYLOAD_PUBLIC_SERVER_URL=https://www.nabea.at` (if used)

## 2. Neon SQL

- [ ] Run [`src/migrations/20260928_000001_fix_cms_slugs_and_seo_meta.sql`](../src/migrations/20260928_000001_fix_cms_slugs_and_seo_meta.sql) on Neon
- [ ] Confirm `/ueber-uns`, `/geschaeftskunden`, `/lieferung-retouren` load
- [ ] Confirm old paths 308/301 to new slugs

## 3. Crawl files (after deploy)

```bash
curl -sI https://www.nabea.at/robots.txt
curl -s https://www.nabea.at/robots.txt | head -40
curl -sI https://www.nabea.at/sitemap.xml
curl -s https://www.nabea.at/llms.txt | head -30
curl -sI https://www.nabea.at/llms-full.txt
```

Expect: robots **200** (not HTML 404), sitemap **200** XML with `www` locs, llms files markdown.

## 4. Google Search Console

- [ ] Property: `https://www.nabea.at` (URL-prefix or Domain)
- [ ] Submit sitemap: `https://www.nabea.at/sitemap.xml`
- [ ] Spot-check Coverage / Page indexing after a few days

## 5. Schema spot-check

- [ ] [Rich Results Test](https://search.google.com/test/rich-results) on homepage (Organization/WebSite)
- [ ] One product URL (Product + BreadcrumbList + FAQPage when FAQs show)

## 6. AI visibility sample (DIY, monthly)

Run each query 3–5 times; log mention rate (e.g. cited 2/5).

Suggested German queries:

1. handgefertigte Olivenholzprodukte Österreich
2. Olivenholz Schneidebrett kaufen Wien
3. Keramik handgemacht Österreich Online Shop
4. Nabea Olivenholz
5. Olivenholz Pflege Tipps
6. lebensmitelechtes Olivenholz Brett
7. Geschäftsgeschenke Olivenholz Österreich
8. Keramik Geschirr handgemacht kaufen
9. Nabea Wien Shop
10. Olivenholz vs Bambus Schneidebrett
11. nachhaltiges Geschirr Österreich
12. handgemachte Keramik Geschenk Österreich
13. Nabea AGB / Impressum (brand entity)
14. Versand Olivenholz Produkte Österreich
15. Geschäftskunden Keramik Hotel Österreich

Platforms: Google (AI Overview if shown), ChatGPT, Perplexity.

## 7. Optional ops (no code)

- [ ] Google Business Profile for NABEA e.U. / Wien
- [ ] Google Merchant Center product feed
- [ ] Brand OG / logo asset → then wire Organization `logo` + default OG image
