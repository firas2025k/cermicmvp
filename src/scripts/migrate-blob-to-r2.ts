/**
 * Copy all Vercel Blob objects into Cloudflare R2 (does NOT delete Blob).
 *
 * Prerequisites in `.env`:
 *   BLOB_READ_WRITE_TOKEN
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT
 *
 * Run:
 *   pnpm migrate:blob-to-r2
 *   DRY_RUN=1 pnpm migrate:blob-to-r2
 */
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { list } from '@vercel/blob'
import { config as loadEnv } from 'dotenv'

loadEnv()

type BlobListItem = {
  url: string
  pathname: string
  contentType?: string
}

async function loadBlobList(): Promise<BlobListItem[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is required')

  const all: BlobListItem[] = []
  let cursor: string | undefined

  do {
    const page = await list({ cursor, limit: 1000, token })
    all.push(...page.blobs)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  return all
}

function createR2Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const endpoint = process.env.R2_ENDPOINT
  const bucket = process.env.R2_BUCKET

  if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
    throw new Error(
      'R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, and R2_BUCKET are required',
    )
  }

  const client = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  })

  return { client, bucket }
}

function keysForBlob(pathname: string): string[] {
  const cleaned = pathname.replace(/^\//, '')
  const decoded = decodeURIComponent(cleaned)
  const keys = new Set<string>([cleaned, decoded])
  const base = decoded.split('/').pop()
  if (base) keys.add(base)
  return [...keys]
}

async function objectExists(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch {
    return false
  }
}

async function main() {
  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'
  console.log(dryRun ? 'DRY RUN — no uploads' : 'LIVE — uploading to R2')

  const blobs = await loadBlobList()
  console.log(`Found ${blobs.length} Blob object(s)`)

  const { client, bucket } = createR2Client()

  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const blob of blobs) {
    const keys = keysForBlob(blob.pathname)
    const primaryKey = keys[0]

    try {
      if (!dryRun) {
        const already = await objectExists(client, bucket, primaryKey)
        if (already) {
          skipped += 1
          console.log(`skip  ${primaryKey}`)
          continue
        }
      }

      if (dryRun) {
        console.log(`would ${primaryKey}`)
        uploaded += 1
        continue
      }

      const res = await fetch(blob.url)
      if (!res.ok) {
        throw new Error(`download HTTP ${res.status} for ${blob.url}`)
      }
      const body = Buffer.from(await res.arrayBuffer())
      const contentType =
        blob.contentType || res.headers.get('content-type') || 'application/octet-stream'

      for (const key of keys) {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
          }),
        )
      }

      uploaded += 1
      console.log(`ok    ${primaryKey} (${body.length} bytes)`)
    } catch (err) {
      failed += 1
      console.error(`fail  ${primaryKey}`, err)
    }
  }

  console.log('\nSummary')
  console.log(`  total:    ${blobs.length}`)
  console.log(`  uploaded: ${uploaded}`)
  console.log(`  skipped:  ${skipped}`)
  console.log(`  failed:   ${failed}`)

  if (failed > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
