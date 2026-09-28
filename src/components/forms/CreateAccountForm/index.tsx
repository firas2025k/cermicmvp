'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  nabeaBodyClass,
  nabeaInputClass,
  nabeaLabelClass,
  nabeaLinkClass,
  nabeaPrimaryBtnClass,
} from '@/blocks/Form/fieldStyles'
import { cn } from '@/utilities/cn'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message =
          response.statusText || 'Beim Erstellen des Kontos ist ein Fehler aufgetreten.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Konto erfolgreich erstellt')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('Die Zugangsdaten sind ungültig. Bitte versuche es erneut.')
      }
    },
    [login, router, searchParams],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className={`${nabeaBodyClass} mb-6`}>
        Erstelle ein Konto, um Bestellungen zu speichern und schneller einzukaufen.
      </p>

      <Message error={error} className="mb-6" />

      <div className="mb-8 flex flex-col gap-6">
        <FormItem>
          <Label htmlFor="email" className={cn(nabeaLabelClass, 'mb-2')}>
            E-Mail-Adresse
          </Label>
          <Input
            id="email"
            className={nabeaInputClass}
            {...register('email', { required: 'E-Mail ist erforderlich.' })}
            type="email"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className={cn(nabeaLabelClass, 'mb-2')}>
            Neues Passwort
          </Label>
          <Input
            id="password"
            className={nabeaInputClass}
            {...register('password', { required: 'Passwort ist erforderlich.' })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className={cn(nabeaLabelClass, 'mb-2')}>
            Passwort bestätigen
          </Label>
          <Input
            id="passwordConfirm"
            className={nabeaInputClass}
            {...register('passwordConfirm', {
              required: 'Bitte bestätige dein Passwort.',
              validate: (value) =>
                value === password.current || 'Die Passwörter stimmen nicht überein',
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>

      <Button disabled={loading} type="submit" variant="default" className={nabeaPrimaryBtnClass}>
        {loading ? 'Wird verarbeitet…' : 'Konto erstellen'}
      </Button>

      <p className={`${nabeaBodyClass} mt-8`}>
        {'Bereits ein Konto? '}
        <Link href={`/login${allParams}`} className={nabeaLinkClass}>
          Anmelden
        </Link>
      </p>
    </form>
  )
}
