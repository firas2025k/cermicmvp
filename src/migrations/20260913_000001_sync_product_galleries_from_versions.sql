-- Sync published product galleries from latest version rows.
-- Cause: some products were saved with extra gallery images in versions
-- but products_gallery (live) still only had the first image — so mobile
-- correctly showed a single image with no thumbs.
--
-- Run on Neon. Safe to re-run (deletes+reinserts only mismatched products).

BEGIN;

CREATE TEMP TABLE tmp_gallery_sync ON COMMIT DROP AS
WITH latest_versions AS (
  SELECT DISTINCT ON (v.parent_id)
    v.id AS version_id,
    v.parent_id AS product_id
  FROM _products_v v
  WHERE v.latest = true
  ORDER BY v.parent_id, v.updated_at DESC
)
SELECT
  lv.product_id,
  lv.version_id
FROM latest_versions lv
INNER JOIN products p ON p.id = lv.product_id
WHERE p._status = 'published'
  AND (
    SELECT COUNT(*)::int
    FROM _products_v_version_gallery vg
    WHERE vg._parent_id = lv.version_id
  ) > (
    SELECT COUNT(*)::int
    FROM products_gallery g
    WHERE g._parent_id = lv.product_id
  );

DELETE FROM products_gallery g
WHERE g._parent_id IN (SELECT product_id FROM tmp_gallery_sync);

INSERT INTO products_gallery (id, _order, _parent_id, image_id, variant_option_id)
SELECT
  COALESCE(NULLIF(vg._uuid, ''), 'gal_' || vg.id::text) AS id,
  vg._order,
  ts.product_id,
  vg.image_id,
  vg.variant_option_id
FROM tmp_gallery_sync ts
INNER JOIN _products_v_version_gallery vg ON vg._parent_id = ts.version_id
ORDER BY ts.product_id, vg._order;

UPDATE products
SET updated_at = NOW()
WHERE id IN (SELECT product_id FROM tmp_gallery_sync);

COMMIT;
