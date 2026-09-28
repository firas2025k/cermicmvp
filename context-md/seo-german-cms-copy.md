# Nabea — German SEO copy for CMS pages

Paste these into Payload **Pages → SEO** (meta title + meta description).  
If you run [`src/migrations/20260928_000001_fix_cms_slugs_and_seo_meta.sql`](../src/migrations/20260928_000001_fix_cms_slugs_and_seo_meta.sql) on Neon, the same values are applied for empty/thin fields and mangled slugs are fixed.

Canonical host: `https://www.nabea.at`

## Slug fixes (after SQL)

| Old (broken) | New |
|---|---|
| `/ber-uns` | `/ueber-uns` |
| `/geschftskunden` | `/geschaeftskunden` |
| `/lieferung--retouren` | `/lieferung-retouren` |

Permanent redirects for the old paths are in `redirects.js`.

## Page meta

### Über uns (`/ueber-uns`)

- **Title:** Über uns | Nabea
- **Description:** Nabea steht für handgefertigte Olivenholzprodukte und Keramik aus Wien – nachhaltig, langlebig und mit Liebe zum Detail.

### Anfrage (`/anfrage`)

- **Title:** Anfrage | Nabea
- **Description:** Stelle eine unverbindliche Anfrage an Nabea – für Geschenke, Geschäftskunden oder individuelle Wünsche zu Olivenholz und Keramik.

### Geschäftskunden (`/geschaeftskunden`)

- **Title:** Geschäftskunden | Nabea
- **Description:** Geschäftskunden und B2B bei Nabea: handgefertigte Olivenholz- und Keramikprodukte für Hotels, Gastronomie und Firmenkunden.

### Lieferung & Retouren (`/lieferung-retouren`)

- **Title:** Lieferung & Retouren | Nabea
- **Description:** Versand aus Wien, Lieferzeiten und Rückgabe: alles zu Lieferung und Retouren bei Nabea.

### Impressum (`/impressum`)

- **Title:** Impressum | Nabea
- **Description:** Impressum und Anbieterkennzeichnung der NABEA e.U., Wien – Betreiberin des Online-Shops nabea.at.

### Datenschutz (`/datenschutz`)

- **Title:** Datenschutz | Nabea
- **Description:** Datenschutzerklärung der NABEA e.U.: Informationen zur Verarbeitung personenbezogener Daten im Online-Shop.

### AGB (`/agb`)

- **Title:** AGB | Nabea
- **Description:** Allgemeine Geschäftsbedingungen (AGB) der NABEA e.U. für Bestellungen im Online-Shop nabea.at.

### Widerruf (`/widerruf`)

- **Title:** Widerruf | Nabea
- **Description:** Widerrufsbelehrung und Informationen zum Widerrufsrecht für Verbraucherinnen und Verbraucher bei Nabea.

### Cookies (`/cookies`)

- **Title:** Cookies | Nabea
- **Description:** Cookie-Richtlinie von Nabea: welche Cookies wir verwenden und wie du deine Einstellungen steuern kannst.

## Products

Almost all published products lack `meta.title` / `meta.description`. In admin, for priority SKUs set:

- **Title:** `{Produktname}` (or `{Produktname} aus Olivenholz` / `… Keramik` when natural)
- **Description:** 1–2 German sentences: material, use, handmade in AT — no keyword stuffing.

Code falls back to product title + plain-text description when meta is empty.
