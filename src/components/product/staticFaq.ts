/**
 * Static FAQ / accordion fallback content shown on the product page when the
 * product has no CMS-authored FAQ data yet.
 *
 * Questions are phrased as natural-language queries so visible UI and FAQPage
 * JSON-LD stay extractable for search and AI citation.
 */

export type AccordionItem = {
  title: string
  body: string | Record<string, unknown>
}

export const STATIC_CARE_AND_SHIPPING: AccordionItem[] = [
  {
    title: 'Wie pflege ich Olivenholz und Keramik von Nabea?',
    body: 'Nur von Hand waschen — nicht einweichen und nicht in die Spülmaschine geben. Bei Bedarf Olivenholz mit lebensmittelechtem Mineralöl nachölen, um den natürlichen Glanz zu erhalten. Alle Maße findest du in der Produktbeschreibung.',
  },
  {
    title: 'Wie lange dauert der Versand und wie funktioniert die Rückgabe?',
    body: 'Versand innerhalb von 1–2 Werktagen aus Wien, Österreich. Kostenloser Standardversand ab 50 €. Rückgabe innerhalb von 30 Tagen für unbenutzte Artikel in Originalverpackung. Kontaktiere uns unter hello@nabea.at, um eine Rücksendung zu starten.',
  },
  {
    title: 'Sind Nabea-Produkte lebensmittelecht?',
    body: 'Ja — alle Oberflächen sind lebensmittelgeeignet. Jedes Stück ist handgefertigt; die Maserung und Farbnuancen können leicht variieren, die Produktbilder sind beispielhaft.',
  },
  {
    title: 'Kann ich ein Produkt personalisieren oder als Geschäftskunde bestellen?',
    body: 'Melde dich über unsere Anfrage-Seite oder per E-Mail an hello@nabea.at. Wir besprechen gerne individuelle Optionen, Geschenksets und Geschäftskunden-Bestellungen.',
  },
]
