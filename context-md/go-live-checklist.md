# Go-live checklist — Nabea (`nabea.at`)

Use this before pointing production traffic at the shop. Check items off as you complete them. Canonical production host: **`https://nabea.at`** (non-www). Brand: **Nabea** / legal: **NABEA e.U.**

Related notes: `vercel-deployment-guide.md`, `stripe-webhooks-go-live.md`, SEO prompts in `implementation-prompts/`, `newsletter-setup.md`, `legal-pages.md`.

---

## 1. Domain and DNS

Currently clients may see a Hostinger “coming soon” page. At launch:

- [ ] Decide cutover time (expect DNS propagation: often minutes–hours, sometimes up to 24–48h)
- [ ] In Hostinger DNS (or after switching nameservers), set records Vercel requires for `nabea.at` (and `www` if you use it)
- [ ] In Vercel → Project → **Settings → Domains**: add `nabea.at` (and `www.nabea.at` → redirect to apex if desired)
- [ ] Confirm HTTPS works on `https://nabea.at`
- [ ] Confirm `www` redirects the way you want (prefer one canonical host)
- [ ] Preserve email DNS: `MX`, SPF, DKIM, DMARC for `nabea.at` / Resend — do not wipe Hostinger mail records when moving the website
- [ ] Remove or replace the Hostinger coming-soon site so it is not still serving the domain

---

## 2. Vercel production environment

- [ ] Production branch is the branch you ship from (usually `main`)
- [ ] Latest launch commit is deployed to **Production** (not only Preview)
- [ ] Deployment Protection / password is **off** for Production (or only if you still want a soft launch gate)
- [ ] Set Production env vars (see section 3) — Preview can keep test values and the `*.vercel.app` URL

---

## 3. Environment variables (Production)

Set these in Vercel → **Settings → Environment Variables** for **Production**:

| Variable | Production value (guide) |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | `https://nabea.at` |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://nabea.at` |
| `NEXT_PUBLIC_SITE_NAME` | `Nabea` |
| `SITE_NAME` | `Nabea` |
| `COMPANY_NAME` | `NABEA e.U.` |
| `PAYLOAD_SECRET` | Strong unique secret (not the demo value) |
| `DATABASE_URI` | Production Neon connection string (`sslmode=require`) |
| `BLOB_READ_WRITE_TOKEN` | Production Vercel Blob token |
| `STRIPE_SECRET_KEY` | **Live** `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Live** `pk_live_…` |
| `STRIPE_WEBHOOKS_SIGNING_SECRET` | Secret from the **live** webhook endpoint |
| `RESEND_API_KEY` | Production Resend key |
| `RESEND_FROM_ADDRESS` | Verified domain address (e.g. `contact@nabea.at`) |
| `RESEND_FROM_NAME` | `Nabea` |
| `RESEND_NEWSLETTER_TOPIC_ID` | Production topic if using newsletter |
| `PREVIEW_SECRET` | Strong secret for draft preview |

- [ ] No `sk_test_` / `pk_test_` on Production
- [ ] Redeploy after changing env vars
- [ ] Never commit `.env` or real secrets

---

## 4. Database (Neon)

- [ ] Production uses a **dedicated** Neon DB (or branch) — not the casual test database if it has junk data
- [ ] Required SQL migrations from `src/migrations/` have been applied on production Neon
- [ ] Backups / point-in-time recovery understood for Neon plan
- [ ] Do **not** run seed against production (seed is destructive)

---

## 5. Payments (Stripe live)

- [ ] Stripe account activated for live charges (business details, payouts, Austria/EU settings)
- [ ] Live API keys in Vercel Production
- [ ] Live webhook endpoint: `https://nabea.at/api/...` (match your real Stripe webhook path) with required events
- [ ] `STRIPE_WEBHOOKS_SIGNING_SECRET` matches that live endpoint
- [ ] Test a **real small live payment** (or Stripe live test approach you trust), then refund if needed
- [ ] Confirm order email / order record created after successful payment
- [ ] Guest checkout and logged-in checkout both work
- [ ] Failed payment / cancel paths do not create false “paid” orders

---

## 6. Email (Resend)

- [ ] Domain `nabea.at` verified in Resend (SPF/DKIM)
- [ ] From address uses the verified domain
- [ ] Inquiry / contact form sends and you receive shop copy
- [ ] Customer confirmation emails send
- [ ] Newsletter subscribe + confirm flow works (if enabled)
- [ ] Back-in-stock / stock notification emails work (if you use them)
- [ ] Check spam folder once; fix DMARC if needed

---

## 7. Media and storage

- [ ] Vercel Blob (or configured storage) works for new uploads in Production
- [ ] Existing product images load on `nabea.at` (no broken Blob URLs)
- [ ] Favicon / OG assets acceptable (logo/default OG still optional follow-up)

---

## 8. Content and shop readiness (Payload admin)

- [ ] Only products that should sell are **published**
- [ ] Prices, stock, variants correct
- [ ] Product SEO fields filled where possible (title, description, image)
- [ ] Homepage looks final (Homepage global + published `home` page SEO title/description)
- [ ] Shop categories and filters look correct
- [ ] Legal pages published and accurate: Impressum, Datenschutz, AGB, Widerruf, Cookies (as applicable)
- [ ] Footer contact email, links, payment icons correct
- [ ] German copy reviewed (`context-md/translation.md` + final owner wording)
- [ ] No placeholder / demo / “Payload Ecommerce Template” text left on public pages
- [ ] Out-of-stock behavior and notify-me copy acceptable

---

## 9. SEO and discovery (after domain is live)

Already in code from SEO phase 1–2; verify on the **live** domain:

- [ ] `https://nabea.at/robots.txt` allows public pages, disallows admin/account/checkout, points at sitemap
- [ ] `https://nabea.at/sitemap.xml` lists home, shop, pages, products
- [ ] Homepage / product `<title>` and meta description look right (view source)
- [ ] Product page has Product + BreadcrumbList + FAQPage JSON-LD (when FAQs exist)
- [ ] Private pages (`/cart`, `/checkout`, `/account`, …) are `noindex`
- [ ] Create Google Search Console property for `https://nabea.at`
- [ ] Submit sitemap: `https://nabea.at/sitemap.xml`
- [ ] Optional: Bing Webmaster Tools
- [ ] Optional later: logo + default OG image in Organization / `mergeOpenGraph`

Do **not** heavily promote or submit Search Console while Hostinger “coming soon” is still the public site.

---

## 10. Security and access

- [ ] Strong unique `PAYLOAD_SECRET`
- [ ] Admin users: only real staff; remove demo accounts
- [ ] 2FA on Vercel, GitHub, Stripe, Neon, Resend, domain registrar
- [ ] Stripe / Neon / Blob tokens are production-scoped and not shared in chat/docs
- [ ] `/admin` works for you and is not linked from the public footer by mistake

---

## 11. Functional smoke test (on `https://nabea.at`)

Run on desktop and phone:

- [ ] Home, shop, category filter, product page
- [ ] Add to cart → checkout → pay (live or carefully controlled)
- [ ] Order confirmation + find-order / account orders
- [ ] Inquiry form
- [ ] Newsletter (if live)
- [ ] Login / create account / logout
- [ ] 404 page acceptable
- [ ] Admin login + edit + publish + image upload

---

## 12. Soft launch / monitoring (first 48 hours)

- [ ] Watch Vercel deployment + runtime logs
- [ ] Watch Stripe Dashboard (payments, webhooks, disputes)
- [ ] Watch Resend logs (bounces/complaints)
- [ ] Watch Neon for connection errors
- [ ] Spot-check Google’s rich results / URL inspection for home + one product (optional)
- [ ] Have a rollback plan: keep previous good Vercel deployment; know how to revert DNS to Hostinger coming-soon if needed

---

## Launch day order (suggested)

1. Freeze content changes briefly  
2. Confirm Production env + Stripe live webhook  
3. Deploy final build to Vercel Production  
4. Point DNS / attach `nabea.at`  
5. Smoke test on `https://nabea.at`  
6. Submit sitemap in Search Console  
7. Announce / send traffic  

---

## Still optional after launch

- Organization logo + default social OG image (code follow-up once assets exist)
- Category landing pages (only if you want to rank per category)
- Core Web Vitals / image performance pass
- Homepage global owning SEO fields (admin convenience only)

---

## Owner notes

Fill in before launch:

- Production Vercel project name: ________________  
- Preview / test URL (`*.vercel.app`): ________________  
- Neon production project: ________________  
- Stripe live webhook URL: ________________  
- Cutover date/time: ________________  
- Person who can revert DNS: ________________  
