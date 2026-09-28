const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // CMS page slugs that lost umlauts / punctuation during import — keep old URLs working
  const mangledCmsSlugRedirects = [
    { source: '/ber-uns', destination: '/ueber-uns', permanent: true },
    { source: '/geschftskunden', destination: '/geschaeftskunden', permanent: true },
    { source: '/lieferung--retouren', destination: '/lieferung-retouren', permanent: true },
  ]

  const redirects = [internetExplorerRedirect, ...mangledCmsSlugRedirects]

  return redirects
}

export default redirects
