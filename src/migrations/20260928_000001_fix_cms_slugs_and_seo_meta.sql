-- Fix mangled CMS page slugs (umlauts/punctuation lost) and fill missing SEO meta.
-- Run on Neon after deploy that adds redirects for the old paths.
-- Safe to re-run (WHERE guards + IF EXISTS not needed for UPDATE).

BEGIN;

-- Slugs
UPDATE pages
SET slug = 'ueber-uns', updated_at = NOW()
WHERE slug = 'ber-uns';

UPDATE pages
SET slug = 'geschaeftskunden', updated_at = NOW()
WHERE slug = 'geschftskunden';

UPDATE pages
SET slug = 'lieferung-retouren', updated_at = NOW()
WHERE slug = 'lieferung--retouren';

-- Versioned drafts/published snapshots
UPDATE _pages_v
SET version_slug = 'ueber-uns', updated_at = NOW()
WHERE version_slug = 'ber-uns';

UPDATE _pages_v
SET version_slug = 'geschaeftskunden', updated_at = NOW()
WHERE version_slug = 'geschftskunden';

UPDATE _pages_v
SET version_slug = 'lieferung-retouren', updated_at = NOW()
WHERE version_slug = 'lieferung--retouren';

-- SEO meta (only fill empty fields)
UPDATE pages
SET
  meta_title = COALESCE(NULLIF(meta_title, ''), 'Über uns | Nabea'),
  meta_description = COALESCE(
    NULLIF(meta_description, ''),
    'Nabea steht für handgefertigte Olivenholzprodukte und Keramik aus Wien – nachhaltig, langlebig und mit Liebe zum Detail.'
  ),
  updated_at = NOW()
WHERE slug = 'ueber-uns';

UPDATE pages
SET
  meta_title = COALESCE(NULLIF(meta_title, ''), 'Anfrage | Nabea'),
  meta_description = COALESCE(
    NULLIF(meta_description, ''),
    'Stelle eine unverbindliche Anfrage an Nabea – für Geschenke, Geschäftskunden oder individuelle Wünsche zu Olivenholz und Keramik.'
  ),
  updated_at = NOW()
WHERE slug = 'anfrage';

UPDATE pages
SET
  meta_title = COALESCE(NULLIF(meta_title, ''), 'Geschäftskunden | Nabea'),
  meta_description = COALESCE(
    NULLIF(meta_description, ''),
    'Geschäftskunden und B2B bei Nabea: handgefertigte Olivenholz- und Keramikprodukte für Hotels, Gastronomie und Firmenkunden.'
  ),
  updated_at = NOW()
WHERE slug = 'geschaeftskunden';

UPDATE pages
SET
  meta_title = COALESCE(NULLIF(meta_title, ''), 'Lieferung & Retouren | Nabea'),
  meta_description = COALESCE(
    NULLIF(meta_description, ''),
    'Versand aus Wien, Lieferzeiten und Rückgabe: alles zu Lieferung und Retouren bei Nabea.'
  ),
  updated_at = NOW()
WHERE slug = 'lieferung-retouren';

-- Strengthen thin legal meta where present but short
UPDATE pages
SET
  meta_title = 'AGB | Nabea',
  meta_description = 'Allgemeine Geschäftsbedingungen (AGB) der NABEA e.U. für Bestellungen im Online-Shop nabea.at.',
  updated_at = NOW()
WHERE slug = 'agb';

UPDATE pages
SET
  meta_title = 'Datenschutz | Nabea',
  meta_description = 'Datenschutzerklärung der NABEA e.U.: Informationen zur Verarbeitung personenbezogener Daten im Online-Shop.',
  updated_at = NOW()
WHERE slug = 'datenschutz';

UPDATE pages
SET
  meta_title = 'Impressum | Nabea',
  meta_description = 'Impressum und Anbieterkennzeichnung der NABEA e.U., Wien – Betreiberin des Online-Shops nabea.at.',
  updated_at = NOW()
WHERE slug = 'impressum';

UPDATE pages
SET
  meta_title = 'Widerruf | Nabea',
  meta_description = 'Widerrufsbelehrung und Informationen zum Widerrufsrecht für Verbraucherinnen und Verbraucher bei Nabea.',
  updated_at = NOW()
WHERE slug = 'widerruf';

UPDATE pages
SET
  meta_title = 'Cookies | Nabea',
  meta_description = 'Cookie-Richtlinie von Nabea: welche Cookies wir verwenden und wie du deine Einstellungen steuern kannst.',
  updated_at = NOW()
WHERE slug = 'cookies';

COMMIT;
