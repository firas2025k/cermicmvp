'use client'

import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { defaultCountries as supportedCountries } from '@payloadcms/plugin-ecommerce/client/react'
import { Address, Config } from '@/payload-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { titles } from './constants'
import { deepMergeSimple } from 'payload/shared'
import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { cn } from '@/utilities/cn'

const LABEL =
  'block font-sans text-[0.7rem] tracking-[0.12em] uppercase mb-1.5 text-[#8C8680]'
const INPUT =
  'w-full font-sans text-sm bg-white px-4 py-3 outline-none transition-colors rounded-none border border-[#E2DBD0] text-[#2C2A27] placeholder:text-[#C5BFB8] focus:border-[#4A5E3A] focus-visible:ring-0 focus-visible:border-[#4A5E3A] shadow-none h-auto'
const SELECT_TRIGGER =
  'w-full font-sans text-sm bg-white px-4 py-3 h-auto min-h-0 rounded-none border border-[#E2DBD0] text-[#2C2A27] shadow-none focus:ring-0 focus:border-[#4A5E3A] data-[placeholder]:text-[#C5BFB8]'

type AddressFormValues = {
  title?: string | null
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
}

type Props = {
  addressID?: Config['db']['defaultIDType']
  initialData?: Omit<Address, 'country' | 'id' | 'updatedAt' | 'createdAt'> & { country?: string }
  callback?: (data: Partial<Address>) => void
  /**
   * If true, the form will not submit to the API.
   */
  skipSubmission?: boolean
}

export const AddressForm: React.FC<Props> = ({
  addressID,
  initialData,
  callback,
  skipSubmission,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddressFormValues>({
    defaultValues: initialData,
  })

  const { createAddress, updateAddress } = useAddresses()

  const onSubmit = useCallback(
    async (data: AddressFormValues) => {
      const newData = deepMergeSimple(initialData || {}, data)

      if (!skipSubmission) {
        if (addressID) {
          await updateAddress(addressID, newData)
        } else {
          await createAddress(newData)
        }
      }

      if (callback) {
        callback(newData)
      }
    },
    [initialData, skipSubmission, callback, addressID, updateAddress, createAddress],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <FormItem className="shrink">
            <label htmlFor="title" className={LABEL}>
              Anrede
            </label>
            <Select
              {...register('title')}
              onValueChange={(value) => {
                setValue('title', value, { shouldValidate: true })
              }}
              defaultValue={initialData?.title || ''}
            >
              <SelectTrigger id="title" className={cn(SELECT_TRIGGER, 'w-auto min-w-[6.5rem]')}>
                <SelectValue placeholder="Anrede" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#E2DBD0]">
                {titles.map((title) => (
                  <SelectItem key={title} value={title} className="rounded-none font-sans text-sm">
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.title && <FormError message={errors.title.message} />}
          </FormItem>

          <FormItem className="grow">
            <label htmlFor="firstName" className={LABEL}>
              Vorname*
            </label>
            <input
              id="firstName"
              autoComplete="given-name"
              className={INPUT}
              {...register('firstName', { required: 'Vorname ist erforderlich.' })}
            />
            {errors.firstName && <FormError message={errors.firstName.message} />}
          </FormItem>

          <FormItem className="grow">
            <label htmlFor="lastName" className={LABEL}>
              Nachname*
            </label>
            <input
              autoComplete="family-name"
              id="lastName"
              className={INPUT}
              {...register('lastName', { required: 'Nachname ist erforderlich.' })}
            />
            {errors.lastName && <FormError message={errors.lastName.message} />}
          </FormItem>
        </div>

        <FormItem>
          <label htmlFor="phone" className={LABEL}>
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            autoComplete="mobile tel"
            className={INPUT}
            {...register('phone')}
          />
          {errors.phone && <FormError message={errors.phone.message} />}
        </FormItem>

        <FormItem>
          <label htmlFor="company" className={LABEL}>
            Firma
          </label>
          <input
            id="company"
            autoComplete="organization"
            className={INPUT}
            {...register('company')}
          />
          {errors.company && <FormError message={errors.company.message} />}
        </FormItem>

        <FormItem>
          <label htmlFor="addressLine1" className={LABEL}>
            Adresszeile 1*
          </label>
          <input
            id="addressLine1"
            autoComplete="address-line1"
            className={INPUT}
            {...register('addressLine1', { required: 'Adresszeile 1 ist erforderlich.' })}
          />
          {errors.addressLine1 && <FormError message={errors.addressLine1.message} />}
        </FormItem>

        <FormItem>
          <label htmlFor="addressLine2" className={LABEL}>
            Adresszeile 2
          </label>
          <input
            id="addressLine2"
            autoComplete="address-line2"
            className={INPUT}
            {...register('addressLine2')}
          />
          {errors.addressLine2 && <FormError message={errors.addressLine2.message} />}
        </FormItem>

        <FormItem>
          <label htmlFor="city" className={LABEL}>
            Stadt*
          </label>
          <input
            id="city"
            autoComplete="address-level2"
            className={INPUT}
            {...register('city', { required: 'Stadt ist erforderlich.' })}
          />
          {errors.city && <FormError message={errors.city.message} />}
        </FormItem>

        <FormItem>
          <label htmlFor="state" className={LABEL}>
            Bundesland
          </label>
          <input
            id="state"
            autoComplete="address-level1"
            className={INPUT}
            {...register('state')}
          />
          {errors.state && <FormError message={errors.state.message} />}
        </FormItem>

        <FormItem>
          <label htmlFor="postalCode" className={LABEL}>
            PLZ*
          </label>
          <input
            id="postalCode"
            className={INPUT}
            {...register('postalCode', { required: 'Postleitzahl ist erforderlich.' })}
          />
          {errors.postalCode && <FormError message={errors.postalCode.message} />}
        </FormItem>

        <FormItem>
          <label htmlFor="country" className={LABEL}>
            Land*
          </label>
          <Select
            {...register('country', {
              required: 'Land ist erforderlich.',
            })}
            onValueChange={(value) => {
              setValue('country', value, { shouldValidate: true })
            }}
            required
            defaultValue={initialData?.country || 'AT'}
          >
            <SelectTrigger id="country" className={SELECT_TRIGGER}>
              <SelectValue placeholder="Land" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#E2DBD0]">
              {supportedCountries.map((country) => {
                const value = typeof country === 'string' ? country : country.value
                const label =
                  typeof country === 'string'
                    ? country
                    : typeof country.label === 'string'
                      ? country.label
                      : value

                return (
                  <SelectItem key={value} value={value} className="rounded-none font-sans text-sm">
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {errors.country && <FormError message={errors.country.message} />}
        </FormItem>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 font-sans text-[0.8rem] tracking-[0.14em] uppercase transition-colors bg-[#6B1F3A] text-[#F8F4EE] hover:bg-[#4E1628]"
      >
        Speichern
      </button>
    </form>
  )
}
