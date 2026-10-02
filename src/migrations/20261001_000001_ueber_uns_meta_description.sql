-- Client-approved meta description for Über uns (/ueber-uns).
-- Run on Neon. Updates live page row and version snapshots so admin stays aligned.

BEGIN;

UPDATE pages
SET
  meta_description = 'Erfahre mehr über NABEA, unsere Geschichte und die besondere Herkunft unseres Oliven',
  updated_at = NOW()
WHERE slug = 'ueber-uns';

UPDATE _pages_v
SET
  version_meta_description = 'Erfahre mehr über NABEA, unsere Geschichte und die besondere Herkunft unseres Oliven',
  updated_at = NOW()
WHERE version_slug = 'ueber-uns';

COMMIT;
