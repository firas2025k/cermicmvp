import { getServerSideURL } from '@/utilities/getURL'

const CONTACT_EMAIL = 'hello@nabea.at'
const INSTAGRAM_URL = 'https://www.instagram.com/nabea.at/'

/** Curated llms.txt overview — keep small enough for agent context windows. */
export function buildLlmsTxtMarkdown(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')

  return `# Nabea

> Handgefertigte Olivenholzprodukte und Keramik aus Wien, Österreich (NABEA e.U.). Sprache der Website: Deutsch (de-AT).

Nabea verkauft nachhaltige, handgemachte Haushalts- und Designprodukte aus Olivenholz und Keramik. Versand aus Wien. Kontakt: ${CONTACT_EMAIL}.

## Shop und Marke

- [Shop](${base}/shop): Alle veröffentlichten Produkte
- [Startseite](${base}/): Markenübersicht und Highlights
- [Über uns](${base}/ueber-uns): Wer Nabea ist und wie die Produkte entstehen
- [Anfrage](${base}/anfrage): Unverbindliche Anfragen, Geschenke, Individualwünsche
- [Geschäftskunden](${base}/geschaeftskunden): B2B und Firmengeschenke
- [Lieferung & Retouren](${base}/lieferung-retouren): Versand und Rückgabe

## Rechtliches

- [Impressum](${base}/impressum)
- [Datenschutz](${base}/datenschutz)
- [AGB](${base}/agb)
- [Widerruf](${base}/widerruf)
- [Cookies](${base}/cookies)

## Optional

- [Vollständige Übersicht (llms-full.txt)](${base}/llms-full.txt): CMS-Seiten und Produktliste
- [Sitemap](${base}/sitemap.xml)
- [Instagram](${INSTAGRAM_URL})
`
}

export function getPublicSiteBaseUrl(): string {
  return getServerSideURL().replace(/\/$/, '') || 'https://www.nabea.at'
}
