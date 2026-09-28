import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { AddressListing } from '@/components/addresses/AddressListing'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { nabeaCardClass, nabeaPageTitleClass } from '@/blocks/Form/fieldStyles'

export default async function AddressesPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Bitte melde dich an, um deine Kontoeinstellungen zu sehen.')}`,
    )
  }

  return (
    <>
      <div className={nabeaCardClass}>
        <h1 className={`${nabeaPageTitleClass} mb-8`}>Adressen</h1>

        <div className="mb-8">
          <AddressListing />
        </div>

        <CreateAddressModal />
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Verwalte deine Adressen.',
  openGraph: mergeOpenGraph({
    title: 'Adressen',
    url: '/account/addresses',
  }),
  robots: {
    follow: false,
    index: false,
  },
  title: 'Adressen',
}
