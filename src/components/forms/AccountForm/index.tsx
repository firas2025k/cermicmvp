'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
  name: User['name']
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const { setUser, user, status } = useAuth()
  const [changePassword, setChangePassword] = useState(false)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          body: JSON.stringify(data),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          toast.success('Konto erfolgreich aktualisiert.')
          setChangePassword(false)
          reset({
            name: json.doc.name,
            email: json.doc.email,
            password: '',
            passwordConfirm: '',
          })
        } else {
          toast.error('Beim Aktualisieren deines Kontos ist ein Fehler aufgetreten.')
        }
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    if (
      user === null &&
      status !== undefined &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login')
    ) {
      router.replace(
        `/login?error=${encodeURIComponent(
          'Du musst angemeldet sein, um diese Seite zu sehen.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
      return
    }

    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, status, router, reset, changePassword])

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      {!changePassword ? (
        <Fragment>
          <p className={`${nabeaBodyClass} mb-8`}>
            {'Ändere unten deine Kontodaten, oder '}
            <button
              type="button"
              className={cn(nabeaLinkClass, 'cursor-pointer bg-transparent p-0 font-sans text-sm')}
              onClick={() => setChangePassword(!changePassword)}
            >
              klicke hier
            </button>
            {', um dein Passwort zu ändern.'}
          </p>

          <div className="mb-8 flex flex-col gap-6">
            <FormItem>
              <Label htmlFor="email" className={cn(nabeaLabelClass, 'mb-2')}>
                E-Mail-Adresse
              </Label>
              <Input
                id="email"
                className={nabeaInputClass}
                {...register('email', { required: 'Bitte gib eine E-Mail-Adresse ein.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="name" className={cn(nabeaLabelClass, 'mb-2')}>
                Name
              </Label>
              <Input
                id="name"
                className={nabeaInputClass}
                {...register('name', { required: 'Bitte gib einen Namen ein.' })}
                type="text"
              />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <p className={`${nabeaBodyClass} mb-8`}>
            {'Ändere unten dein Passwort, oder '}
            <button
              type="button"
              className={cn(nabeaLinkClass, 'cursor-pointer bg-transparent p-0 font-sans text-sm')}
              onClick={() => setChangePassword(!changePassword)}
            >
              abbrechen
            </button>
            .
          </p>

          <div className="mb-8 flex flex-col gap-6">
            <FormItem>
              <Label htmlFor="password" className={cn(nabeaLabelClass, 'mb-2')}>
                Neues Passwort
              </Label>
              <Input
                id="password"
                className={nabeaInputClass}
                {...register('password', { required: 'Bitte gib ein neues Passwort ein.' })}
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
                  required: 'Bitte bestätige dein neues Passwort.',
                  validate: (value) =>
                    value === password.current || 'Die Passwörter stimmen nicht überein',
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <Button
        disabled={isLoading || isSubmitting || !isDirty}
        type="submit"
        variant="default"
        className={nabeaPrimaryBtnClass}
      >
        {isLoading || isSubmitting
          ? 'Wird verarbeitet…'
          : changePassword
            ? 'Passwort ändern'
            : 'Konto aktualisieren'}
      </Button>
    </form>
  )
}
