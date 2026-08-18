'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { RichText } from '@/components/RichText'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { buildInitialFormState } from './buildInitialFormState'
import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { DefaultDocumentIDType } from 'payload'

export type Value = unknown

export interface Property {
  [key: string]: Value
}

export interface Data {
  [key: string]: Property | Property[]
}

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
}

export const FormBlock: React.FC<
  FormBlockType & {
    id?: DefaultDocumentIDType
  }
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: buildInitialFormState(formFromProps.fields),
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: Data) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <section className="bg-linen">
      <div className="mx-auto max-w-xl px-6 py-16 lg:px-10 lg:py-24">
        {enableIntro && introContent && !hasSubmitted && (
          <div className="inquiry-form-intro mb-10">
            <RichText data={introContent} enableGutter={false} />
          </div>
        )}

        <div className="border border-warm-border bg-[#F7F3EE] p-6 sm:p-10">
          <FormProvider {...formMethods}>
            {!isLoading && hasSubmitted && confirmationType === 'message' && (
              <div className="inquiry-form-intro">
                <RichText data={confirmationMessage} />
              </div>
            )}
            {isLoading && !hasSubmitted && (
              <p className="font-sans text-sm text-warm-gray">Wird gesendet…</p>
            )}
            {error && (
              <p className="mb-6 font-sans text-sm text-terra">
                {error.message || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'}
              </p>
            )}
            {!hasSubmitted && (
              <form id={formID} onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8 space-y-6">
                  {formFromProps &&
                    formFromProps.fields &&
                    formFromProps.fields?.map((field, index) => {
                      const Field: React.FC<any> | undefined =
                        fields?.[field.blockType as keyof typeof fields]

                      if (Field) {
                        return (
                          <div key={index}>
                            <Field
                              form={formFromProps}
                              {...field}
                              {...formMethods}
                              control={control}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        )
                      }
                      return null
                    })}
                </div>

                <button
                  form={formID}
                  type="submit"
                  className="inline-block px-8 py-3.5 font-sans text-sm tracking-wide border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200 rounded-none"
                >
                  {submitButtonLabel}
                </button>
              </form>
            )}
          </FormProvider>
        </div>
      </div>

      <style>{`
        .inquiry-form-intro h1,
        .inquiry-form-intro h2,
        .inquiry-form-intro h3,
        .inquiry-form-intro h4,
        .inquiry-form-intro p {
          font-family: var(--font-serif, 'Cormorant Garamond', Georgia, serif);
          font-weight: 300;
          color: #2C2A27;
          line-height: 1.3;
        }
        .inquiry-form-intro h1,
        .inquiry-form-intro h2,
        .inquiry-form-intro h3,
        .inquiry-form-intro h4 {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          margin-bottom: 0.75rem;
        }
        .inquiry-form-intro p {
          font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
          font-size: 1rem;
          font-weight: 300;
          color: #8C8680;
          line-height: 1.7;
          margin-bottom: 0.75rem;
        }
        .inquiry-form-intro p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </section>
  )
}
