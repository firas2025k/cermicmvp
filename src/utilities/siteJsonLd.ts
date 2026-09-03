import { absoluteUrl } from './absoluteUrl'
import { getServerSideURL } from './getURL'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Nabea'
const LEGAL_NAME = process.env.COMPANY_NAME || 'NABEA e.U.'
const CONTACT_EMAIL = 'hello@nabea.at'
const INSTAGRAM_URL = 'https://www.instagram.com/nabea.at/'

export function getSiteJsonLd() {
  const url = getServerSideURL().replace(/\/$/, '') || absoluteUrl('/') || 'https://nabea.at'

  const organization = {
    '@type': 'Organization',
    '@id': `${url}/#organization`,
    name: LEGAL_NAME,
    legalName: LEGAL_NAME,
    alternateName: SITE_NAME,
    url,
    email: CONTACT_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wien',
      addressCountry: 'AT',
    },
    sameAs: [INSTAGRAM_URL],
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${url}/#website`,
    name: SITE_NAME,
    url,
    inLanguage: 'de-AT',
    publisher: {
      '@id': `${url}/#organization`,
    },
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website],
  }
}
