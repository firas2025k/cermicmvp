/**
 * One-off: create published legal pages + footer legal links.
 * Run: pnpm payload run src/scripts/seed-legal-pages.ts
 *
 * Placeholder German copy only — replace with lawyer-approved text in admin.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

type LexicalText = {
  type: 'text'
  detail: 0
  format: 0
  mode: 'normal'
  style: ''
  text: string
  version: 1
}

function textNode(text: string): LexicalText {
  return {
    type: 'text',
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    version: 1,
  }
}

function heading(text: string, tag: 'h1' | 'h2' = 'h1') {
  return {
    type: 'heading' as const,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    tag,
    version: 1,
  }
}

function paragraph(text: string) {
  return {
    type: 'paragraph' as const,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function richText(nodes: ReturnType<typeof heading | typeof paragraph>[]) {
  return {
    root: {
      type: 'root' as const,
      children: nodes,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

const LEGAL_PAGES = [
  {
    slug: 'impressum',
    title: 'Impressum',
    metaDescription: 'Impressum und Anbieterkennzeichnung von Nabea.',
    intro:
      'Angaben gemäß § 5 ECG / § 25 MedienG. Bitte ersetze diesen Platzhaltertext durch die vollständigen Impressumsangaben (Firma, Adresse, Kontakt, UID, etc.).',
    body: [
      'Firmenname: [Firmenname eintragen]',
      'Adresse: [Straße, PLZ Ort, Österreich]',
      'E-Mail: hello@nabea.at',
      'Telefon: [Telefonnummer eintragen]',
      'UID-Nummer: [UID eintragen]',
      'Geschäftsführung: [Name eintragen]',
      'Diese Seite dient als Platzhalter und muss vor dem Livegang rechtlich geprüft und vervollständigt werden.',
    ],
  },
  {
    slug: 'datenschutz',
    title: 'Datenschutzerklärung',
    metaDescription: 'Informationen zur Verarbeitung personenbezogener Daten bei Nabea.',
    intro:
      'Platzhalter für die Datenschutzerklärung (DSGVO). Ersetze diesen Text durch eine vollständige, rechtskonforme Datenschutzerklärung.',
    body: [
      'Wir verarbeiten personenbezogene Daten nur im Rahmen der gesetzlichen Vorgaben.',
      'Zu den typischen Verarbeitungszwecken gehören Bestellabwicklung, Kundenkonto, Newsletter und Website-Analyse.',
      'Bitte ergänze Angaben zu Verantwortlichem, Rechtsgrundlagen, Speicherdauer, Empfängern, Cookies, Betroffenenrechten und Kontakt für Datenschutzanfragen.',
      'Diese Seite ist ein Platzhalter und muss vor dem Livegang durch geprüften Rechtstext ersetzt werden.',
    ],
  },
  {
    slug: 'agb',
    title: 'AGB',
    metaDescription: 'Allgemeine Geschäftsbedingungen von Nabea.',
    intro:
      'Platzhalter für die Allgemeinen Geschäftsbedingungen. Ersetze diesen Text durch deine verbindlichen AGB.',
    body: [
      'Geltungsbereich: Diese AGB gelten für alle Bestellungen über unseren Online-Shop.',
      'Vertragsschluss: Mit Abschluss der Bestellung kommt ein Kaufvertrag zustande.',
      'Preise und Zahlung: Alle Preise verstehen sich in Euro inkl. gesetzlicher MwSt., sofern nicht anders angegeben.',
      'Lieferung: Versand erfolgt gemäß den auf der Website angegebenen Lieferbedingungen.',
      'Diese Seite ist ein Platzhalter und muss vor dem Livegang durch geprüften Rechtstext ersetzt werden.',
    ],
  },
  {
    slug: 'widerruf',
    title: 'Widerrufsbelehrung',
    metaDescription: 'Informationen zum Widerrufsrecht bei Nabea.',
    intro:
      'Platzhalter für die Widerrufsbelehrung und das Widerrufsformular. Ersetze diesen Text durch den gesetzlich vorgeschriebenen Text.',
    body: [
      'Verbraucherinnen und Verbraucher haben bei Fernabsatzverträgen grundsätzlich ein 14-tägiges Widerrufsrecht.',
      'Bitte ergänze hier die vollständige Widerrufsbelehrung inkl. Frist, Folgen des Widerrufs und ggf. Ausnahmen.',
      'Füge außerdem ein Muster-Widerrufsformular hinzu.',
      'Diese Seite ist ein Platzhalter und muss vor dem Livegang durch geprüften Rechtstext ersetzt werden.',
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie-Richtlinie',
    metaDescription: 'Informationen zur Verwendung von Cookies auf der Nabea-Website.',
    intro:
      'Platzhalter für die Cookie-Richtlinie. Ersetze diesen Text durch eine vollständige Übersicht der eingesetzten Cookies.',
    body: [
      'Wir verwenden Cookies und ähnliche Technologien, um die Website zu betreiben und ggf. Nutzungsstatistiken zu erstellen.',
      'Bitte liste hier notwendige Cookies, Statistik-/Marketing-Cookies, Anbieter, Speicherdauer und Opt-in/Opt-out-Möglichkeiten auf.',
      'Verweise ggf. auf die Datenschutzerklärung und das Cookie-Banner.',
      'Diese Seite ist ein Platzhalter und muss vor dem Livegang durch geprüften Rechtstext ersetzt werden.',
    ],
  },
] as const

const FOOTER_LINKS = [
  { label: 'Impressum', url: '/impressum' },
  { label: 'Datenschutz', url: '/datenschutz' },
  { label: 'AGB', url: '/agb' },
  { label: 'Widerruf', url: '/widerruf' },
  { label: 'Cookies', url: '/cookies' },
]

async function main() {
  const payload = await getPayload({ config })

  for (const page of LEGAL_PAGES) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      title: page.title,
      slug: page.slug,
      generateSlug: false,
      _status: 'published' as const,
      publishedOn: new Date().toISOString(),
      meta: {
        title: page.title,
        description: page.metaDescription,
      },
      hero: {
        type: 'lowImpact' as const,
        richText: richText([heading(page.title, 'h1')]),
      },
      layout: [
        {
          blockType: 'content' as const,
          columns: [
            {
              size: 'full' as const,
              enableLink: false,
              richText: richText([
                paragraph(page.intro),
                heading('Inhalt', 'h2'),
                ...page.body.map((line) => paragraph(line)),
              ]),
            },
          ],
        },
      ],
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
        draft: false,
      })
      console.log(`Updated legal page /${page.slug}`)
    } else {
      await payload.create({
        collection: 'pages',
        data,
        overrideAccess: true,
        draft: false,
      })
      console.log(`Created legal page /${page.slug}`)
    }
  }

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      legalLinks: FOOTER_LINKS.map((link) => ({
        label: link.label,
        url: link.url,
      })),
    },
    overrideAccess: true,
  })

  console.log('Footer legal links updated')
}

await main()
