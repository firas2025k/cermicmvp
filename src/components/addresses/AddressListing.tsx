'use client'

import React from 'react'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { AddressItem } from '@/components/addresses/AddressItem'
import { nabeaBodyClass } from '@/blocks/Form/fieldStyles'

export const AddressListing: React.FC = () => {
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return <p className={nabeaBodyClass}>Keine Adressen gefunden.</p>
  }

  return (
    <div>
      <ul className="flex flex-col gap-8">
        {addresses.map((address) => (
          <li key={address.id} className="border-b border-warm-border pb-8 last:border-none last:pb-0">
            <AddressItem address={address} />
          </li>
        ))}
      </ul>
    </div>
  )
}
