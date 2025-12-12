# Vercel Blob Storage Setup - Complete ✅

## What Was Changed

### ✅ 1. Updated `src/payload.config.ts`
- Added import for `vercelBlobStorage`
- Added Vercel Blob Storage plugin to the plugins array
- Configured to use `BLOB_READ_WRITE_TOKEN` environment variable

### ✅ 2. Updated `src/collections/Media.ts`
- Removed local file storage configuration (`staticDir`)
- Cleaned up unused imports (`path`, `fileURLToPath`)

### ✅ 3. Updated `next.config.js`
- Added Vercel Blob Storage domain to `remotePatterns` for Next.js Image optimization
- Allows images from `*.public.blob.vercel-storage.com`

## What You Need to Do Next

### Step 1: Install the Package

Run this command in your terminal:

```bash
pnpm add @payloadcms/storage-vercel-blob
```

### Step 2: Enable Vercel Blob Storage

1. **Go to your Vercel project dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Enable Blob Storage**
   - Click on the **"Storage"** tab
   - Click **"Create Database"**
   - Select **"Blob"** from the options
   - Click **"Create"**

3. **Get the Token** (Automatic)
   - Vercel automatically creates `BLOB_READ_WRITE_TOKEN`
   - It's automatically available as an environment variable
   - You don't need to manually add it!

### Step 3: Test Locally (Optional)

If you want to test locally before deploying:

1. **Get your Blob token from Vercel:**
   - Go to your project → Settings → Environment Variables
   - Copy the `BLOB_READ_WRITE_TOKEN` value

2. **Add to your local `.env` file:**
   ```bash
   BLOB_READ_WRITE_TOKEN=your-token-here
   ```

3. **Test upload:**
   - Start your dev server: `pnpm dev`
   - Go to `/admin` → Media
   - Upload an image
   - It should now upload to Vercel Blob Storage!

### Step 4: Deploy to Vercel

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add Vercel Blob Storage support"
   git push
   ```

2. **Vercel will automatically:**
   - Install the new package
   - Use the `BLOB_READ_WRITE_TOKEN` environment variable
   - Deploy with Blob Storage enabled

## How It Works

- **Local Development:** Files upload to Vercel Blob Storage (if token is set)
- **Production:** Files upload to Vercel Blob Storage automatically
- **Image URLs:** Files are served from `*.public.blob.vercel-storage.com`
- **CDN:** Vercel automatically serves files from their global CDN

## Verification

After deployment, verify it's working:

1. Go to your deployed site → `/admin`
2. Navigate to Media collection
3. Upload a test image
4. Check the image URL - it should be from `*.public.blob.vercel-storage.com`

## Troubleshooting

### Issue: "BLOB_READ_WRITE_TOKEN is not defined"
**Solution:** Make sure you've enabled Blob Storage in your Vercel project dashboard.

### Issue: Images not loading
**Solution:** 
- Check that `next.config.js` includes the Vercel Blob domain
- Verify the image URL starts with `https://*.public.blob.vercel-storage.com`

### Issue: Upload fails locally
**Solution:** 
- Make sure you've added `BLOB_READ_WRITE_TOKEN` to your local `.env` file
- Restart your dev server after adding the token

## Next Steps

- ✅ Code changes complete
- ⏳ Install package: `pnpm add @payloadcms/storage-vercel-blob`
- ⏳ Enable Blob Storage in Vercel dashboard
- ⏳ Deploy and test!

## Benefits

- ✅ **10 GB free storage** on Vercel's free tier
- ✅ **Automatic CDN** - fast global delivery
- ✅ **No external accounts** needed
- ✅ **Seamless integration** with Vercel deployments
- ✅ **Persistent storage** - files survive deployments

