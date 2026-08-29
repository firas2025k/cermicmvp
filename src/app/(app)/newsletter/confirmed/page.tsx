import Link from 'next/link'
import type { Metadata } from 'next'

type Props = {
  searchParams: Promise<{ status?: string | string[] | undefined }>
}

export const metadata: Metadata = {
  title: 'Newsletter-Anmeldung',
  description: 'Bestätigung deiner Newsletter-Anmeldung.',
}

export default async function NewsletterConfirmedPage({ searchParams }: Props) {
  const params = await searchParams
  const status = Array.isArray(params.status) ? params.status[0] : params.status

  const content =
    status === 'success'
      ? {
          title: 'Newsletter-Anmeldung bestätigt',
          message: 'Vielen Dank! Du erhältst ab jetzt unseren Newsletter.',
        }
      : status === 'error'
        ? {
            title: 'Anmeldung nicht abgeschlossen',
            message:
              'Die Newsletter-Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es später erneut.',
          }
        : {
            title: 'Ungültiger Bestätigungslink',
            message:
              'Der Bestätigungslink ist ungültig oder abgelaufen. Bitte melde dich erneut für den Newsletter an.',
          }

  return (
    <div className="container py-28">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-4 font-serif text-4xl font-light text-charcoal">{content.title}</h1>
        <p className="mb-8 font-sans text-sm text-warm-gray">{content.message}</p>
        <Link
          href="/"
          className="inline-flex border border-olive px-6 py-3 font-sans text-xs tracking-wide text-olive transition-colors hover:bg-olive hover:text-linen"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}
