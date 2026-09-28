'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  nabeaBodyClass,
  nabeaInputClass,
  nabeaLabelClass,
  nabeaPageTitleClass,
  nabeaPrimaryBtnClass,
} from '@/blocks/Form/fieldStyles'
import { cn } from '@/utilities/cn'

type FormData = {
  email: string
}

export const ForgotPasswordForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(async (data: FormData) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/forgot-password`,
      {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    )

    if (response.ok) {
      setSuccess(true)
      setError('')
    } else {
      setError(
        'Beim Senden der E-Mail zum Zurücksetzen des Passworts ist ein Fehler aufgetreten. Bitte versuche es erneut.',
      )
    }
  }, [])

  return (
    <Fragment>
      {!success && (
        <React.Fragment>
          <h1 className={`${nabeaPageTitleClass} mb-3`}>Passwort vergessen</h1>
          <p className={`${nabeaBodyClass} mb-8`}>
            Gib unten deine E-Mail-Adresse ein. Du erhältst eine E-Mail mit Anweisungen zum
            Zurücksetzen deines Passworts.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Message className="mb-6" error={error} />

            <FormItem className="mb-8">
              <Label htmlFor="email" className={cn(nabeaLabelClass, 'mb-2')}>
                E-Mail-Adresse
              </Label>
              <Input
                id="email"
                className={nabeaInputClass}
                {...register('email', { required: 'Bitte gib deine E-Mail-Adresse ein.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <Button type="submit" variant="default" className={nabeaPrimaryBtnClass}>
              Link senden
            </Button>
          </form>
        </React.Fragment>
      )}
      {success && (
        <React.Fragment>
          <h1 className={`${nabeaPageTitleClass} mb-3`}>Anfrage gesendet</h1>
          <p className={nabeaBodyClass}>
            Prüfe deine E-Mails — dort findest du einen Link zum sicheren Zurücksetzen deines
            Passworts.
          </p>
        </React.Fragment>
      )}
    </Fragment>
  )
}
