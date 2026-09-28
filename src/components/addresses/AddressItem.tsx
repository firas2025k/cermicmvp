'use client'

import React from 'react'
import type { Address } from '@/payload-types'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'

type Props = {
  address: Partial<Omit<Address, 'country'>> & { country?: string } // Allow address to be partial and entirely optional as this is entirely for display purposes
  /**
   * Completely override the default actions
   */
  actions?: React.ReactNode
  /**
   * Insert elements before the actions
   */
  beforeActions?: React.ReactNode
  /**
   * Insert elements after the actions
   */
  afterActions?: React.ReactNode
  /**
   * Hide all actions
   */
  hideActions?: boolean
}

export const AddressItem: React.FC<Props> = ({
  address,
  actions,
  hideActions = false,
  beforeActions,
  afterActions,
}) => {
  if (!address) {
    return null
  }

  return (
    <div className="flex items-start gap-4">
      <div className="grow font-sans text-sm leading-relaxed text-[#2C2A27]">
        <p className="font-medium">
          {address.title && <span>{address.title} </span>}
          {address.firstName} {address.lastName}
        </p>
        {address.company ? <p className="text-[#8C8680]">{address.company}</p> : null}
        {address.phone ? <p className="text-[#8C8680]">{address.phone}</p> : null}
        <p>
          {address.addressLine1}
          {address.addressLine2 && <>, {address.addressLine2}</>}
        </p>
        <p>
          {address.postalCode} {address.city}
          {address.state ? `, ${address.state}` : ''}
        </p>
        <p className="text-[#8C8680]">{address.country}</p>
      </div>

      {(!hideActions || actions) && (
        <div className="flex shrink-0 flex-col gap-2">
          {actions ? (
            actions
          ) : !hideActions ? (
            <>
              {beforeActions}
              {address.id ? (
                <CreateAddressModal
                  addressID={address.id}
                  initialData={address}
                  buttonText="Bearbeiten"
                  modalTitle="Adresse bearbeiten"
                />
              ) : null}
              {afterActions}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
