-- Rewrite Payload media URLs from local/proxy paths (and any Vercel Blob hosts)
-- to the Cloudflare R2 public base URL.
--
-- BEFORE RUNNING: set the public base to match R2_PUBLIC_BASE_URL (no trailing slash).
-- Example temporary host:
--   https://pub-b4508900e8674156b2b6eebcd77d629f.r2.dev
-- Prefer custom domain when ready:
--   https://media.nabea.at
--
-- Safe: updates URL strings only. Does not delete media rows or files.
-- Review with the SELECTs first, then run the UPDATEs.

-- ========== REVIEW ==========
SELECT id, filename, url
FROM media
WHERE url IS NOT NULL
  AND (
    url LIKE '/api/media/file/%'
    OR url LIKE '%public.blob.vercel-storage.com%'
  )
ORDER BY id
LIMIT 50;

SELECT
  COUNT(*) FILTER (
    WHERE url LIKE '/api/media/file/%'
       OR url LIKE '%public.blob.vercel-storage.com%'
  )::int AS urls_to_rewrite,
  COUNT(*)::int AS total_media
FROM media;

-- ========== APPLY (edit the public base below) ==========
-- Replace BOTH occurrences of the public base URL with your R2_PUBLIC_BASE_URL.

BEGIN;

UPDATE media
SET url =
  'https://pub-b4508900e8674156b2b6eebcd77d629f.r2.dev/' || filename
WHERE filename IS NOT NULL
  AND filename <> ''
  AND (
    url LIKE '/api/media/file/%'
    OR url LIKE '%public.blob.vercel-storage.com%'
  );

UPDATE media
SET thumbnail_u_r_l =
  'https://pub-b4508900e8674156b2b6eebcd77d629f.r2.dev/' || filename
WHERE thumbnail_u_r_l IS NOT NULL
  AND filename IS NOT NULL
  AND filename <> ''
  AND (
    thumbnail_u_r_l LIKE '/api/media/file/%'
    OR thumbnail_u_r_l LIKE '%public.blob.vercel-storage.com%'
  );

-- Spot-check before commit:
-- SELECT id, filename, url FROM media ORDER BY id DESC LIMIT 20;

COMMIT;
