# Two environments: production (`nabea.at`) vs testing

Goal: keep **real customers on `nabea.at`** safe while you test on a separate URL (your current Ceramic / `*.vercel.app` setup). Pushing experimental work must **not** update the live shop.

This complements `go-live-checklist.md` and `vercel-deployment-guide.md`.

---

## Recommended model (one Vercel project, two “worlds”)

You do **not** need two GitHub repos. Use **one repo** + **one Vercel project** with:

| World | Who uses it | Branch | URL | Database / Stripe |
| --- | --- | --- | --- | --- |
| **Production** | Real customers | `main` (only) | `https://nabea.at` | Production Neon + **live** Stripe |
| **Testing / Preview** | You | `staging` and/or feature branches | `https://….vercel.app` (or a custom staging domain) | **Separate** Neon + **test** Stripe |

Rule of thumb:

- Everyday work → feature branch → Preview URL  
- Merge to `staging` when you want a stable test site  
- Merge to `main` **only** when you intentionally ship to `nabea.at`

---

## 1. Protect production in Vercel

In the Vercel project → **Settings → Git**:

1. Set **Production Branch** to `main` (or whatever you ship from).
2. Confirm that **only** that branch triggers a **Production** deployment.
3. All other branches get **Preview** deployments (safe URLs, not `nabea.at`).

In **Settings → Domains**:

- Attach `nabea.at` (and `www` → redirect if you want) to **Production** only.
- Do **not** point `nabea.at` at Preview deployments.

Optional but useful: add a staging domain later, e.g. `staging.nabea.at` → assign it to the **Preview** or a specific branch (`staging`) in Domains settings.

---

## 2. Create a `staging` branch (stable test site)

From your machine:

```bash
git checkout main
git pull
git checkout -b staging
git push -u origin staging
```

Then:

1. Open the Preview URL Vercel creates for `staging`.
2. Bookmark that URL as your “Ceramic / test shop”.
3. Keep testing there before anything merges to `main`.

Daily workflow:

```bash
# New work
git checkout staging
git pull
git checkout -b feature/my-change

# … commit, push …
git push -u origin feature/my-change

# Open PR → Vercel Preview URL for that branch
# After review, merge into staging (not main)
# Smoke-test on the staging Preview URL
# Only then open PR: staging → main (or merge to main deliberately)
```

**Never push experimental commits straight to `main`.**

---

## 3. Separate environment variables (critical)

In Vercel → **Settings → Environment Variables**, set values **per environment**:

| Variable group | Production (`nabea.at`) | Preview / staging |
| --- | --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | `https://nabea.at` | Your Preview URL (or `https://staging.nabea.at`) |
| `PAYLOAD_PUBLIC_SERVER_URL` | same as above | same as Preview URL |
| `DATABASE_URI` | **Production Neon** | **Different Neon DB or branch** |
| Stripe keys | `sk_live_…` / `pk_live_…` | `sk_test_…` / `pk_test_…` |
| Stripe webhook secret | Live endpoint secret | Test endpoint secret |
| Resend / email | Real `nabea.at` from-address | Test inbox / same domain with care |
| Blob / storage | Prefer separate store or prefix | Prefer separate store or prefix |

Mark each variable for:

- **Production** → live only  
- **Preview** → all branch previews (including `staging`)  
- **Development** → local `pnpm dev` if you use Vercel env pull  

If Production and Preview share the **same** `DATABASE_URI`, test orders and CMS edits will hit real data. **Do not share the production database with Preview.**

### Neon setup (recommended)

1. Keep current production Neon for `nabea.at`.
2. Create a second Neon project **or** a Neon branch named `staging`.
3. Put that connection string only on Vercel **Preview** (and local `.env` for testing).
4. Run SQL migrations from `src/migrations/` on **both** databases when schema changes.
5. Never run seed against production Neon.

---

## 4. Separate Stripe (so test checkouts never charge customers)

| | Production | Testing |
| --- | --- | --- |
| Keys | Live | Test |
| Webhook URL | `https://nabea.at/api/…` (your real Stripe webhook path) | Preview URL webhook path |
| Dashboard | Live mode | Test mode |

In Stripe Dashboard, create a **test-mode** webhook pointing at your Preview/staging URL. Keep the live webhook only on `nabea.at`.

---

## 5. Optional: GitHub branch protection

On GitHub → repo → **Settings → Branches** → protect `main`:

- Require a pull request before merge  
- Require at least one approval (if you have a partner)  
- Optionally: require Vercel status checks to pass  

That makes “oops I pushed to production” much harder.

---

## 6. What happens when you push

| You push to… | Vercel builds… | Customers on `nabea.at` see it? |
| --- | --- | --- |
| `feature/…` | Preview deployment | No |
| `staging` | Preview (or staging domain) | No |
| `main` | **Production** → `nabea.at` | **Yes** |

So: test freely on feature/`staging` previews; ship only by merging to `main`.

---

## 7. Checklist before first safe split

- [ ] Vercel Production Branch = `main`
- [ ] `nabea.at` attached only to Production
- [ ] Preview env vars use a **non-production** Neon URL
- [ ] Preview uses Stripe **test** keys + test webhook
- [ ] Production uses live Stripe + production Neon
- [ ] `staging` branch exists and has a known Preview URL
- [ ] Team knows: never commit experiments on `main`
- [ ] Migrations applied on both DBs when schema changes

---

## 8. Alternative: two Vercel projects

If you want stronger isolation (separate dashboards, env UIs, deploy hooks):

1. Project A — **Nabea production** — Git connected, Production branch `main`, domain `nabea.at`.
2. Project B — **Ceramic staging** — same repo, Production branch `staging`, domain e.g. `staging.nabea.at` or a `*.vercel.app` name.

Use this if one project’s Preview/Production env split feels confusing. For most cases, **one Vercel project + Production/`main` + Preview/`staging`** is enough.

---

## 9. Local development

Keep a local `.env` (never commit it) pointed at the **test** Neon + Stripe test keys. Use production credentials only when you intentionally debug a production-only issue, and never seed or truncate production.

---

## Short “do this next” path

1. Create and push `staging`.  
2. In Vercel, confirm Production Branch = `main` and domains = `nabea.at`.  
3. Duplicate Neon → assign Preview `DATABASE_URI` to the copy.  
4. Put Stripe **test** keys on Preview; leave live keys on Production only.  
5. Work on feature branches → merge to `staging` to test → merge to `main` to go live.

Once that is in place, pushing random experiments will update Preview/staging only, not real-time clients on `nabea.at`.
