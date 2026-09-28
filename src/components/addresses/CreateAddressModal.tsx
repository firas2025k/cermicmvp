'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AddressForm } from '@/components/forms/AddressForm'
import { Address } from '@/payload-types'
import { DefaultDocumentIDType } from 'payload'
import { cn } from '@/utilities/cn'

type Props = {
  addressID?: DefaultDocumentIDType
  initialData?: Partial<Omit<Address, 'country'>> & { country?: string }
  buttonText?: string
  modalTitle?: string
  callback?: (address: Partial<Address>) => void
  skipSubmission?: boolean
  disabled?: boolean
  /**
   * Visual style of the trigger button.
   * - outline: warm border (default) — secondary actions
   * - solid: bordeaux — primary checkout CTA
   */
  buttonVariant?: 'outline' | 'solid'
  className?: string
}

const outlineBtn =
  'inline-flex w-full sm:w-auto items-center justify-center border border-[#E2DBD0] bg-white px-5 py-3 font-sans text-[0.75rem] tracking-[0.14em] uppercase text-[#2C2A27] transition-colors hover:border-[#4A5E3A] hover:text-[#4A5E3A] disabled:cursor-not-allowed disabled:opacity-40'
const solidBtn =
  'inline-flex w-full sm:w-auto items-center justify-center bg-[#6B1F3A] px-5 py-3 font-sans text-[0.75rem] tracking-[0.14em] uppercase text-[#F8F4EE] transition-colors hover:bg-[#4E1628] disabled:cursor-not-allowed disabled:opacity-40'

export const CreateAddressModal: React.FC<Props> = ({
  addressID,
  initialData,
  buttonText = 'Neue Adresse hinzufügen',
  modalTitle = 'Neue Adresse hinzufügen',
  callback,
  skipSubmission,
  disabled,
  buttonVariant = 'outline',
  className,
}) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (state: boolean) => {
    setOpen(state)
  }

  const closeModal = () => {
    setOpen(false)
  }

  const handleCallback = (data: Partial<Address>) => {
    closeModal()

    if (callback) {
      callback(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className={cn(buttonVariant === 'solid' ? solidBtn : outlineBtn, className)}
        >
          {buttonText}
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-[#E2DBD0] bg-[#F8F4EE] p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light text-[#2C2A27]">
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="font-sans text-sm text-[#8C8680]">
            {skipSubmission
              ? 'Bitte gib deine Adresse für diese Bestellung ein.'
              : 'Diese Adresse wird mit deinem Konto verknüpft.'}
          </DialogDescription>
        </DialogHeader>

        <AddressForm
          addressID={addressID}
          initialData={initialData}
          callback={handleCallback}
          skipSubmission={skipSubmission}
        />
      </DialogContent>
    </Dialog>
  )
}
