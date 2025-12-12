# Vercel Deployment Guide

This guide outlines the special configuration needed to deploy your Payload CMS + Next.js ecommerce app to Vercel.

## Prerequisites

- Vercel account
- PostgreSQL database (Supabase, Neon, or similar)
- Stripe account (for payments)
- Cloud storage for media files (S3, Cloudflare R2, etc.) - **REQUIRED** for Vercel

## Important: Why Cloud Storage is Required

Vercel uses a **read-only file system** in production. This means:
- Local file uploads won't persist between deployments
- Media files uploaded through Payload CMS will be lost
- You **must** configure a cloud storage adapter (S3, Cloudflare R2, etc.)

## Step 1: Environment Variables

Add these environment variables in your Vercel project settings (Settings → Environment Variables):

### Required Variables

```bash
# Payload CMS
PAYLOAD_SECRET=your-random-secret-key-min-32-chars
DATABASE_URI=postgresql://user:password@host:5432/database

# Server URLs (Vercel will auto-populate VERCEL_URL, but set these explicitly)
NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app
PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.vercel.app

# Stripe (use production keys in production)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...

# Optional: Preview/Draft
PREVIEW_SECRET=your-preview-secret

# Optional: Company/Site Info
COMPANY_NAME="Your Company Name"
SITE_NAME="Your Site Name"
TWITTER_CREATOR="@yourhandle"
TWITTER_SITE="https://your-domain.com"
```

### Vercel Auto-Detected Variables

Vercel automatically provides these (you don't need to set them manually):
- `VERCEL_URL` - The deployment URL
- `VERCEL_PROJECT_PRODUCTION_URL` - Production URL

Your code already handles these in `src/utilities/getURL.ts`.

## Step 2: Build Settings

In Vercel project settings:

### Build Command
```bash
pnpm build
```

### Output Directory
```
.next
```

### Install Command
```bash
pnpm install
```

### Node.js Version
Set to: `20.x` or `18.20.2+` (as specified in `package.json` engines)

## Step 3: Configure Cloud Storage (CRITICAL)

You **must** configure a cloud storage adapter. Here are options:

### Option A: AWS S3 (Recommended)

1. Install the S3 adapter:
```bash
pnpm add @payloadcms/storage-s3
```

2. Update `src/payload.config.ts`:
```typescript
import { s3Storage } from '@payloadcms/storage-s3'

// Add to plugins array:
s3Storage({
  collections: {
    media: {
      bucket: process.env.S3_BUCKET_NAME!,
      prefix: 'media',
    },
  },
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    region: process.env.S3_REGION!,
  },
})
```

3. Add S3 environment variables in Vercel:
```bash
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-1
```

### Option B: Cloudflare R2 (Cheaper Alternative)

1. Install the S3-compatible adapter (R2 uses S3 API):
```bash
pnpm add @payloadcms/storage-s3
```

2. Update `src/payload.config.ts`:
```typescript
import { s3Storage } from '@payloadcms/storage-s3'

// Add to plugins array:
s3Storage({
  collections: {
    media: {
      bucket: process.env.R2_BUCKET_NAME!,
      prefix: 'media',
    },
  },
  config: {
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  },
})
```

3. Add R2 environment variables in Vercel:
```bash
R2_BUCKET_NAME=your-bucket-name
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_ACCOUNT_ID=your-account-id
```

## Step 4: Update Image Configuration

After configuring cloud storage, update `next.config.js` to allow images from your storage:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-s3-bucket.s3.amazonaws.com', // or your R2 domain
      },
      {
        protocol: 'https',
        hostname: 'your-cdn-domain.com', // if using CloudFront/CDN
      },
      // Keep existing NEXT_PUBLIC_SERVER_URL pattern
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  // ... rest of config
}
```

## Step 5: Stripe Webhooks

Configure Stripe webhooks to point to your Vercel deployment:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhooks`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook signing secret and add it to Vercel as `STRIPE_WEBHOOKS_SIGNING_SECRET`

## Step 6: Database Connection

Ensure your PostgreSQL database:
- Allows connections from Vercel's IP ranges (or use connection pooling)
- Has SSL enabled (most cloud providers require this)
- Connection string format: `postgresql://user:password@host:5432/database?sslmode=require`

## Step 7: Deploy

1. Connect your GitHub repository to Vercel
2. Configure environment variables (Step 1)
3. Set build settings (Step 2)
4. Deploy!

## Step 8: Post-Deployment Checklist

- [ ] Verify admin panel loads: `https://your-domain.vercel.app/admin`
- [ ] Create your first admin user
- [ ] Test media uploads (should go to cloud storage)
- [ ] Test Stripe checkout flow
- [ ] Verify webhooks are receiving events
- [ ] Check that homepage loads correctly
- [ ] Test guest checkout functionality

## Common Issues

### Issue: Build fails with "Module not found"
**Solution:** Ensure `pnpm install` runs before build. Check that all dependencies are in `package.json`.

### Issue: Media uploads fail
**Solution:** 
- Verify cloud storage credentials are correct
- Check that storage adapter is properly configured in `payload.config.ts`
- Ensure bucket permissions allow uploads

### Issue: Database connection errors
**Solution:**
- Verify `DATABASE_URI` is correct
- Check database allows connections from Vercel IPs
- Ensure SSL is enabled in connection string

### Issue: Stripe webhooks not working
**Solution:**
- Verify webhook endpoint URL is correct
- Check `STRIPE_WEBHOOKS_SIGNING_SECRET` matches Stripe dashboard
- Ensure webhook events are selected in Stripe dashboard

### Issue: Images not loading
**Solution:**
- Verify `next.config.js` includes your storage domain in `remotePatterns`
- Check that media URLs are using the correct storage domain
- Ensure CORS is configured on your storage bucket

## Performance Optimization

### Enable ISR (Incremental Static Regeneration)
Your homepage already uses `revalidatePath` for on-demand revalidation. Consider adding ISR for product pages:

```typescript
export const revalidate = 3600 // Revalidate every hour
```

### Use Vercel Edge Network
Consider using Vercel's Edge Functions for API routes that don't need database access.

## Monitoring

- Set up Vercel Analytics
- Monitor Stripe webhook logs
- Check Payload CMS admin logs
- Monitor database connection pool usage

## Security Checklist

- [ ] Use production Stripe keys (not test keys)
- [ ] Ensure `PAYLOAD_SECRET` is strong and unique
- [ ] Use HTTPS only (Vercel handles this automatically)
- [ ] Restrict database access to Vercel IPs if possible
- [ ] Use environment variables for all secrets (never commit)
- [ ] Enable 2FA on Vercel account
- [ ] Review access control in Payload collections

## Next Steps

After successful deployment:
1. Set up a custom domain
2. Configure email service (for order confirmations, password resets)
3. Set up monitoring and error tracking (Sentry, etc.)
4. Configure CDN for media files (CloudFront, Cloudflare)
5. Set up automated backups for database

