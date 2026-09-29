# Migrate media: Vercel Blob → Cloudflare R2

Ordered cutover for Nabea. Does **not** delete Blob or CMS content.

## Prerequisites

Local `.env` (or shell env) must include:

- `BLOB_READ_WRITE_TOKEN` — existing Vercel Blob token  
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_ENDPOINT` / `R2_PUBLIC_BASE_URL`

Optional packages for the copy script (if imports fail):

```bash
pnpm add @aws-sdk/client-s3@3.1141.0
pnpm add @vercel/blob@0.22.3
```

## 1) Copy files (before deploying the storage switch)

```bash
# Preview
DRY_RUN=1 pnpm migrate:blob-to-r2

# Live copy
pnpm migrate:blob-to-r2
```

Expect `uploaded` + `skipped` ≈ total Blob objects, `failed` = 0.

## 2) Deploy code that points Payload at R2

Already prepared in this PR/commit: `@payloadcms/storage-s3`, `Media` local fallback, `next.config.js` remotePatterns.

```bash
pnpm generate:importmap
```

Then deploy (push to `main` / Vercel).

## 3) Rewrite Neon URLs

Run [`src/migrations/2026-09-29-rewrite-media-urls-to-r2.sql`](../src/migrations/2026-09-29-rewrite-media-urls-to-r2.sql) in the Neon SQL editor after confirming `R2_PUBLIC_BASE_URL` in the file matches production.

Most rows today use `/api/media/file/...` — those become `${R2_PUBLIC_BASE_URL}/${filename}`.

## 4) Verify

Open product pages on https://www.nabea.at and confirm images load from the R2 public host.

## 5) Later

- Re-enable Next Image (`images.unoptimized: false`) and watch for 402s.  
- Delete Vercel Blob objects only after a confidence period.
