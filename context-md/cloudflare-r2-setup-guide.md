# Cloudflare R2 setup guide (Nabea media)

Use this to create the R2 bucket and API credentials for Payload CMS.

Aligned with current Cloudflare R2 docs:

- [Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Authentication (R2 API tokens)](https://developers.cloudflare.com/r2/api/tokens/)
- [AWS SDK for JavaScript v3](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)
- [CORS](https://developers.cloudflare.com/r2/buckets/cors/)

Do **not** commit secrets to git. Prefer **Vercel → Project → Settings → Environment Variables** (Production + Preview).

---

## Important Cloudflare guidance (read this first)

| Topic | Cloudflare recommendation | What we do for Nabea |
|-------|---------------------------|----------------------|
| Public delivery | Buckets are private by default; you must explicitly enable public access | Required for shop product images |
| `r2.dev` URL | Cloudflare-managed subdomain for **non-production**; **rate-limited** | OK for a quick test upload only |
| Production public URL | **Custom domain** (e.g. `media.nabea.at`) — enables Cache, WAF, Bot Management | **Preferred** for the live shop |
| CNAME to `r2.dev` | **Unsupported** — do not point DNS at `*.r2.dev` | Use Cloudflare “Custom Domains” on the bucket instead |
| S3 API | Endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, SDK `region: "auto"` | What Payload `@payloadcms/storage-s3` will use |
| API tokens | Use **R2 API tokens** (Access Key ID + Secret), not a global Cloudflare API key; scope to one bucket | Object Read & Write on `nabea-media` only |
| CORS | Needed when a **browser** on another origin reads/uploads cross-origin | Add policy for `https://www.nabea.at` (+ apex if used) |

**Production target:** public files served from **`https://media.nabea.at/...`** (custom domain on the bucket).  
**Temporary unblock (optional):** enable `r2.dev` only to verify a test file, then switch `R2_PUBLIC_BASE_URL` to the custom domain before / during the migration so we do not bake rate-limited URLs into the database.

---

## What you need beforehand

- Cloudflare account: [https://dash.cloudflare.com](https://dash.cloudflare.com)
- R2 enabled on the account (Cloudflare may ask you to accept R2 billing; tokens require R2 to be purchased/enabled)
- Ideally: ability to add DNS for **`media.nabea.at`**
  - If `nabea.at` is already a zone in this same Cloudflare account → easiest
  - If DNS is still on Hostinger only → use Cloudflare **partial (CNAME) setup** for the zone, or move the zone to Cloudflare, then attach the custom domain to the bucket (see [Public buckets → Add your domain](https://developers.cloudflare.com/r2/buckets/public-buckets/))

---

## Step 1 — Open R2

1. Log in to the Cloudflare dashboard.
2. Left sidebar → **R2 Object Storage**.
3. If prompted, enable R2 / accept billing.

---

## Step 2 — Create the bucket

1. Click **Create bucket**.
2. **Bucket name:** `nabea-media` (lowercase, no spaces) → this is `R2_BUCKET`.
3. Location: leave default / automatic unless you need a **jurisdiction** (EU/FedRAMP/US).  
   - If you create a jurisdictional bucket, the S3 endpoint changes (e.g. `https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com`). Prefer **no jurisdiction** unless you have a legal reason.
4. Create the bucket.

---

## Step 3 — Public access

### 3a — Optional smoke test with Public Development URL (`r2.dev`)

Cloudflare labels this **Public Development URL**. It is rate-limited and intended for non-production.

1. Open bucket → **Settings**.
2. Under **Public Development URL**, select **Enable**.
3. Confirm by typing `allow` when asked.
4. Copy the **Public Bucket URL** (e.g. `https://pub-xxxxx.r2.dev`).
5. Upload a tiny test image in the R2 UI and open `https://pub-xxxxx.r2.dev/<filename>` in a browser.

Do **not** create a DNS CNAME pointing at this `r2.dev` host.

### 3b — Production: connect a custom domain (preferred)

1. Same bucket → **Settings** → **Custom Domains** → **Add**.
2. Enter e.g. `media.nabea.at` → **Continue**.
3. Review the DNS record Cloudflare will add → **Connect Domain**.
4. Wait until status is **Active** (may take a few minutes; refresh / retry if needed).
5. That hostname becomes **`R2_PUBLIC_BASE_URL`** = `https://media.nabea.at` (no trailing slash).

The domain must exist as a zone in the **same Cloudflare account** as the bucket (full setup or partial CNAME setup).

**For the migration, prefer sending us the custom-domain URL** so Neon media rows are rewritten once to the production host.

---

## Step 4 — CORS (recommended for public shop media)

Images are loaded from `www.nabea.at` while files live on another host (`media.nabea.at` or `pub-….r2.dev`). Simple `<img>` tags often work without CORS, but Cloudflare recommends a CORS policy for cross-origin browser access, and it helps if anything fetches the object from JS.

1. Bucket → **Settings** → **CORS Policy** → **Add CORS policy**.
2. Paste (JSON tab), then **Save**:

```json
[
  {
    "AllowedOrigins": [
      "https://www.nabea.at",
      "https://nabea.at",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

If uploads ever go **directly from the browser to R2** (presigned PUT), you would add `"PUT"` and tighten `AllowedHeaders` — Payload’s usual path uploads via the server, so **GET/HEAD is enough** for now.

---

## Step 5 — Account ID and S3 endpoint

1. R2 overview → copy **Account ID** → `R2_ACCOUNT_ID`.
2. Set:

```text
R2_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
```

Payload / AWS SDK will use **`region: "auto"`** (required by the SDK; R2 ignores AWS regions).

---

## Step 6 — Create an R2 API token (S3 credentials)

This is **not** a normal Cloudflare “API Tokens” Global Key. Use **R2 → Manage API Tokens**.

1. R2 overview → Account details → **Manage** next to **API Tokens**.
2. Prefer **Create Account API token** (stays valid if your user leaves; still revokeable) **or** User API token — either works.
3. Settings:
   - **Name:** `nabea-payload-media`
   - **Permissions:** **Object Read & Write** (S3: read/write/list objects)
   - **Scope:** specific bucket → `nabea-media` only (least privilege)
4. Create token.
5. Copy immediately (secret shown once):
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`

You do **not** need Admin Read & Write unless you want the token to create/delete buckets.

---

## Step 7 — Fill this checklist

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=nabea-media
R2_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
# Prefer custom domain for production:
R2_PUBLIC_BASE_URL=https://media.nabea.at
# Temporary test only (rate-limited):
# R2_PUBLIC_BASE_URL=https://pub-xxxxxxxx.r2.dev
```

Rules:

- No trailing `/` on `R2_PUBLIC_BASE_URL`
- Endpoint Account ID must match the account that owns the bucket
- Bucket name exact match

---

## What to send back (so we can implement)

1. `R2_BUCKET`
2. `R2_ENDPOINT`
3. `R2_PUBLIC_BASE_URL` (**prefer** `https://media.nabea.at`)
4. Confirmation that Access Key ID + Secret are set on **Vercel** (Production ± Preview)
5. Checklist:

- [ ] Bucket `nabea-media` created  
- [ ] Custom domain Active **or** (temporary) `r2.dev` Allowed for testing  
- [ ] CORS policy saved for `www.nabea.at`  
- [ ] R2 API token: Object Read & Write, scoped to this bucket  
- [ ] Test object URL loads in a browser  

---

## What we will do after you confirm

1. Point Payload at R2 with **`@payloadcms/storage-s3`** (official “R2 via S3 API” config) — **not** `@payloadcms/storage-r2` (that package is Cloudflare Workers–only).
2. Copy existing Vercel Blob files → R2 (CMS content kept; Blob kept as backup until verified).
3. Rewrite `media.url` in Neon to `R2_PUBLIC_BASE_URL`.
4. Deploy and verify the live shop.
5. Re-enable Vercel `next/image` optimization.

---

## Payload package note (`storage-r2` vs `storage-s3`)

From [Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters):

| Package | When to use |
|---------|-------------|
| `@payloadcms/storage-r2` | Payload running **inside Cloudflare Workers**, with an R2 **binding** (`cloudflare.env.R2`). Beta. |
| `@payloadcms/storage-s3` | Payload on **Vercel / Node** talking to R2 over the **S3-compatible API** (access keys + endpoint). **This is us.** |

Also required in config (Payload’s R2 example): `forcePathStyle: true`, `generateFileURL` → public domain, `disablePayloadAccessControl: true` for public media.

---

## Quick troubleshooting

| Problem | What to check |
|---------|----------------|
| Cannot create API token | R2 must be enabled/purchased on the account |
| Custom domain stuck Initializing | Zone must be in the **same** Cloudflare account; retry connection; Enterprise zone hold if applicable |
| `r2.dev` works but production should not rely on it | Rate limits / no Cache-WAF — finish custom domain |
| Browser CORS errors on media | CORS policy origins/methods; purge cache on custom domain after CORS changes |
| S3 auth errors from Payload later | Wrong endpoint Account ID, wrong keys, or token not scoped to this bucket |
| Jurisdictional bucket auth fails | Must use jurisdiction-specific endpoint (EU/US/FedRAMP) |

---

*Stack note: Nabea stays on Vercel for the Next.js app; R2 only replaces Vercel Blob for media objects. Payload docs recommend `@payloadcms/storage-s3` for this setup; `@payloadcms/storage-r2` is for Workers bindings only.*
