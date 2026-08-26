'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

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
          // Make sure to include cookies with fetch
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
    // Only redirect if:
    // 1. User is explicitly null (not undefined, which means still loading)
    // 2. Auth status is determined (not undefined)
    // 3. We're not already on the login page (to avoid loops)
    // The server-side check in account/page.tsx already handles authentication
    // This client-side check is just a safety net
    if (
      user === null &&
      status !== undefined &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login')
    ) {
      // Use replace instead of push to avoid adding to history stack
      router.replace(
        `/login?error=${encodeURIComponent(
          'Du musst angemeldet sein, um diese Seite zu sehen.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
      return
    }

    // Once user is loaded, reset form to have default values
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
          <div className="prose dark:prose-invert mb-8">
            <p className="">
              {'Ändere unten deine Kontodaten, oder '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                klicke hier
              </Button>
              {', um dein Passwort zu ändern.'}
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="email" className="mb-2">
                E-Mail-Adresse
              </Label>
              <Input
                id="email"
                {...register('email', { required: 'Bitte gib eine E-Mail-Adresse ein.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="name" className="mb-2">
                Name
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Bitte gib einen Namen ein.' })}
                type="text"
              />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {'Ändere unten dein Passwort, oder '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                abbrechen
              </Button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="password" className="mb-2">
                Neues Passwort
              </Label>
              <Input
                id="password"
                {...register('password', { required: 'Bitte gib ein neues Passwort ein.' })}
                type="password"
              />
              {errors.password && <FormError message={errors.password.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="passwordConfirm" className="mb-2">
                Passwort bestätigen
              </Label>
              <Input
                id="passwordConfirm"
                {...register('passwordConfirm', {
                  required: 'Bitte bestätige dein neues Passwort.',
                  validate: (value) => value === password.current || 'Die Passwörter stimmen nicht überein',
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <Button disabled={isLoading || isSubmitting || !isDirty} type="submit" variant="default">
        {isLoading || isSubmitting
          ? 'Wird verarbeitet…'
          : changePassword
            ? 'Passwort ändern'
            : 'Konto aktualisieren'}
      </Button>
    </form>
  )
}
