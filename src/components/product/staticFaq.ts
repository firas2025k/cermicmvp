/**
 * Static FAQ / accordion fallback content shown on the product page when the
 * product has no CMS-authored FAQ data yet.
 *
 * Swap this out with a Payload field once the content team is ready — the
 * accordion UI expects the same shape { title: string; body: string }[].
 */

export type AccordionItem = {
  title: string
  body: string | Record<string, unknown>
}

export const STATIC_CARE_AND_SHIPPING: AccordionItem[] = [
  {
    title: 'Maße & Pflege',
    body: 'Alle Maße findest du in der Produktbeschreibung oben. Nur von Hand waschen — nicht einweichen und nicht in die Spülmaschine geben. Bei Bedarf mit lebensmittelechtem Mineralöl nachölen, um den natürlichen Glanz zu erhalten.',
  },
  {
    title: 'Versand & Rückgabe',
    body: 'Versand innerhalb von 1–2 Werktagen aus Wien, Österreich. Kostenloser Standardversand ab 50 €. Rückgabe innerhalb von 30 Tagen für unbenutzte Artikel in Originalverpackung. Kontaktiere uns unter hello@nabea.at, um eine Rücksendung zu starten.',
  },
  {
    title: 'FAQ',
    body: 'Ist das lebensmittelecht? Ja — alle Oberflächen sind lebensmittelgeeignet. Kann ich ein Produkt personalisieren? Melde dich über unsere Kontaktseite, wir besprechen gerne individuelle Optionen. Variiert die Maserung? Ja, jedes Stück ist einzigartig; die Bilder sind beispielhaft.',
  },
]
