# Cloud Storage Setup Comparison

## Current Situation

Your app currently uses **local file storage**:
- Files are saved to: `public/media/`
- This works fine locally
- **Will NOT work on Vercel** (read-only filesystem)

## Option 1: AWS S3

### Setup Steps

1. **Create S3 Bucket**
   - Go to AWS Console → S3
   - Create bucket (e.g., `your-app-media`)
   - Choose region (e.g., `us-east-1`)
   - Disable "Block all public access" (or configure bucket policy)
   - Enable CORS for your domain

2. **Create IAM User**
   - Go to IAM → Users → Create User
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

3. **Configure Bucket Policy** (for public read access)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. **Install Package**
```bash
pnpm add @payloadcms/storage-s3
```

5. **Environment Variables** (add to Vercel)
```bash
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_REGION=us-east-1
```

### Cost Estimate
- Storage: ~$0.023/GB/month
- Requests: ~$0.0004 per 1,000 GET requests
- Transfer: First 100GB free, then ~$0.09/GB

**Monthly estimate for small site**: $1-5/month

---

## Option 2: Cloudflare R2 (Recommended)

### Setup Steps

1. **Create R2 Bucket**
   - Go to Cloudflare Dashboard → R2
   - Create bucket (e.g., `your-app-media`)
   - Note your Account ID (found in R2 dashboard URL)

2. **Create API Token**
   - Go to R2 → Manage R2 API Tokens
   - Create token with "Object Read & Write" permissions
   - Save Access Key ID and Secret Access Key

3. **Configure Public Access** (optional, for direct image URLs)
   - Go to bucket → Settings → Public Access
   - Enable "Allow Access" and configure CORS

4. **Install Package** (uses S3-compatible API)
```bash
pnpm add @payloadcms/storage-s3
```

5. **Environment Variables** (add to Vercel)
```bash
R2_BUCKET_NAME=your-bucket-name
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_ACCOUNT_ID=your-account-id
```

### Cost Estimate
- Storage: ~$0.015/GB/month
- Requests: Free (no egress fees!)
- Transfer: **FREE** (unlimited)

**Monthly estimate for small site**: $0.50-2/month

---

## Implementation Code

### For AWS S3

**src/payload.config.ts:**
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

**src/collections/Media.ts:**
```typescript
// Remove or comment out:
// upload: {
//   staticDir: path.resolve(dirname, '../../public/media'),
// },
```

**next.config.js:**
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-bucket-name.s3.amazonaws.com',
    },
    // ... existing patterns
  ],
}
```

### For Cloudflare R2

**src/payload.config.ts:**
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

**src/collections/Media.ts:**
```typescript
// Remove or comment out:
// upload: {
//   staticDir: path.resolve(dirname, '../../public/media'),
// },
```

**next.config.js:**
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'pub-*.r2.dev', // R2 public bucket domain
    },
    // Or use custom domain if configured:
    // {
    //   protocol: 'https',
    //   hostname: 'media.yourdomain.com',
    // },
    // ... existing patterns
  ],
}
```

---

## Recommendation

**Choose Cloudflare R2** if:
- ✅ You want to save money (no egress fees)
- ✅ You're already using Cloudflare (or open to it)
- ✅ You want simpler pricing

**Choose AWS S3** if:
- ✅ You're already using AWS
- ✅ You need AWS-specific features
- ✅ You prefer the more established ecosystem

---

## Migration Path

1. **Set up cloud storage** (S3 or R2)
2. **Install adapter package**
3. **Update code** (I can do this)
4. **Test locally** with cloud storage
5. **Migrate existing files** (if any) from `public/media` to cloud
6. **Deploy to Vercel** with environment variables

---

## Questions to Answer

1. Do you already have AWS or Cloudflare accounts?
2. Do you have existing media files to migrate?
3. What's your expected storage/bandwidth usage?
4. Do you prefer one provider over the other?

