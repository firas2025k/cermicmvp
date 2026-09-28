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
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  nabeaBodyClass,
  nabeaInputClass,
  nabeaLabelClass,
  nabeaLinkClass,
  nabeaOutlineBtnClass,
  nabeaPrimaryBtnClass,
} from '@/blocks/Form/fieldStyles'
import { cn } from '@/utilities/cn'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/account')
      } catch (_) {
        setError('Die Zugangsdaten sind ungültig. Bitte versuche es erneut.')
      }
    },
    [login, router],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Message className="mb-6" error={error} />
      <div className="mb-8 flex flex-col gap-6">
        <FormItem>
          <Label htmlFor="email" className={cn(nabeaLabelClass, 'mb-2')}>
            E-Mail
          </Label>
          <Input
            id="email"
            type="email"
            className={nabeaInputClass}
            {...register('email', { required: 'E-Mail ist erforderlich.' })}
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className={cn(nabeaLabelClass, 'mb-2')}>
            Passwort
          </Label>
          <Input
            id="password"
            type="password"
            className={nabeaInputClass}
            {...register('password', { required: 'Bitte gib ein Passwort ein.' })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <p className={nabeaBodyClass}>
          Passwort vergessen?{' '}
          <Link href={`/forgot-password${allParams}`} className={nabeaLinkClass}>
            Hier zurücksetzen
          </Link>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild variant="outline" size="lg" className={cn(nabeaOutlineBtnClass, 'grow')}>
          <Link href={`/create-account${allParams}`}>Konto erstellen</Link>
        </Button>
        <Button
          className={cn(nabeaPrimaryBtnClass, 'grow')}
          disabled={isLoading}
          size="lg"
          type="submit"
          variant="default"
        >
          {isLoading ? 'Wird verarbeitet…' : 'Anmelden'}
        </Button>
      </div>
    </form>
  )
}
