'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

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
          <h1 className="text-xl mb-4">Passwort vergessen</h1>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {`Gib unten deine E-Mail-Adresse ein. Du erhältst eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts. `}
              
            </p>
          </div>
          <form className="max-w-lg" onSubmit={handleSubmit(onSubmit)}>
            <Message className="mb-8" error={error} />

            <FormItem className="mb-8">
              <Label htmlFor="email" className="mb-2">
                E-Mail-Adresse
              </Label>
              <Input
                id="email"
                {...register('email', { required: 'Bitte gib deine E-Mail-Adresse ein.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <Button type="submit" variant="default">
              Passwort vergessen
            </Button>
          </form>
        </React.Fragment>
      )}
      {success && (
        <React.Fragment>
          <h1 className="text-xl mb-4">Anfrage gesendet</h1>
          <div className="prose dark:prose-invert">
            <p>Prüfe deine E-Mails — dort findest du einen Link zum sicheren Zurücksetzen deines Passworts.</p>
          </div>
        </React.Fragment>
      )}
    </Fragment>
  )
}
