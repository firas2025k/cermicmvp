import { NextResponse } from 'next/server'

import {
  createNewsletterConfirmationToken,
  getNewsletterConfirmationUrl,
  hasNewsletterConfiguration,
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  sendNewsletterConfirmationEmail,
} from '@/lib/newsletter'

const GENERIC_SUCCESS_MESSAGE =
  'Bitte prüfe deine E-Mail-Adresse und bestätige dort deine Newsletter-Anmeldung.'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const email = normalizeNewsletterEmail(body?.email)

    if (!isValidNewsletterEmail(email)) {
      return NextResponse.json(
        { message: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        { status: 400 },
      )
    }

    if (body?.consent !== true) {
      return NextResponse.json(
        { message: 'Bitte bestätige deine Einwilligung zum Newsletter.' },
        { status: 400 },
      )
    }

    if (!hasNewsletterConfiguration()) {
      console.error('[newsletter] Required Resend configuration is missing')
      return NextResponse.json(
        { message: 'Die Newsletter-Anmeldung ist derzeit nicht verfügbar.' },
        { status: 503 },
      )
    }

    const token = createNewsletterConfirmationToken(email)
    const confirmationUrl = getNewsletterConfirmationUrl(token)

    await sendNewsletterConfirmationEmail({ email, confirmationUrl })

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
  } catch (error) {
    console.error('[newsletter] Subscription request failed:', error)
    return NextResponse.json(
      { message: 'Die Newsletter-Anmeldung ist derzeit nicht verfügbar.' },
      { status: 500 },
    )
  }
}
