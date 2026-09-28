'use client'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Address } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useState } from 'react'

type Props = {
  selectedAddress?: Address
  setAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  heading?: string
  description?: string
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>
}

const outlineBtn =
  'inline-flex w-full sm:w-auto items-center justify-center border border-[#E2DBD0] bg-white px-5 py-3 font-sans text-[0.75rem] tracking-[0.14em] uppercase text-[#2C2A27] transition-colors hover:border-[#4A5E3A] hover:text-[#4A5E3A]'
const solidBtn =
  'inline-flex items-center justify-center bg-[#6B1F3A] px-4 py-2.5 font-sans text-[0.7rem] tracking-[0.14em] uppercase text-[#F8F4EE] transition-colors hover:bg-[#4E1628]'

export const CheckoutAddresses: React.FC<Props> = ({
  setAddress,
  heading = 'Adressen',
  description = 'Bitte wähle oder füge deine Liefer- und Rechnungsadresse hinzu.',
}) => {
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <div className="space-y-4">
        <p className="font-sans text-sm text-[#8C8680]">
          Keine Adressen gefunden. Bitte füge eine Adresse hinzu.
        </p>
        <CreateAddressModal buttonVariant="solid" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-1 font-serif text-lg font-light text-[#2C2A27]">{heading}</h3>
        <p className="font-sans text-sm text-[#8C8680]">{description}</p>
      </div>
      <AddressesModal setAddress={setAddress} />
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ setAddress }) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const closeModal = () => {
    setOpen(false)
  }
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <p className="font-sans text-sm text-[#8C8680]">
        Keine Adressen gefunden. Bitte füge eine Adresse hinzu.
      </p>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className={outlineBtn}>
          Adresse auswählen
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-[#E2DBD0] bg-[#F8F4EE] p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light text-[#2C2A27]">
            Adresse auswählen
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-6">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="border-b border-[#E2DBD0] pb-6 last:border-none last:pb-0"
              >
                <AddressItem
                  address={address}
                  hideActions
                  beforeActions={null}
                  actions={
                    <button
                      type="button"
                      className={solidBtn}
                      onClick={(e) => {
                        e.preventDefault()
                        setAddress(address)
                        closeModal()
                      }}
                    >
                      Auswählen
                    </button>
                  }
                />
              </li>
            ))}
          </ul>

          <CreateAddressModal />
        </div>
      </DialogContent>
    </Dialog>
  )
}
