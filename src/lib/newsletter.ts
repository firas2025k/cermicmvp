import jwt from 'jsonwebtoken'

import { getServerSideURL } from '@/utilities/getURL'

const RESEND_API_URL = 'https://api.resend.com'
const NEWSLETTER_TOKEN_PURPOSE = 'newsletter-confirmation'

type NewsletterToken = {
  email: string
  purpose: typeof NEWSLETTER_TOKEN_PURPOSE
}

type ResendRequestOptions = RequestInit & {
  allowStatuses?: number[]
}

export const normalizeNewsletterEmail = (email: unknown): string =>
  typeof email === 'string' ? email.trim().toLowerCase() : ''

export const isValidNewsletterEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const hasNewsletterConfiguration = (): boolean =>
  Boolean(
    process.env.PAYLOAD_SECRET &&
      process.env.RESEND_API_KEY &&
      process.env.RESEND_FROM_ADDRESS &&
      process.env.RESEND_NEWSLETTER_TOPIC_ID,
  )

export const createNewsletterConfirmationToken = (email: string): string => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is not configured')

  return jwt.sign(
    { email, purpose: NEWSLETTER_TOKEN_PURPOSE } satisfies NewsletterToken,
    secret,
    {
      algorithm: 'HS256',
      expiresIn: '24h',
    },
  )
}

export const getNewsletterConfirmationUrl = (token: string): string =>
  `${getServerSideURL()}/api/newsletter/confirm?token=${encodeURIComponent(token)}`

export const verifyNewsletterConfirmationToken = (token: string): string => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is not configured')

  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] })
  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    decoded.purpose !== NEWSLETTER_TOKEN_PURPOSE ||
    typeof decoded.email !== 'string'
  ) {
    throw new Error('Invalid newsletter confirmation token')
  }

  const email = normalizeNewsletterEmail(decoded.email)
  if (!isValidNewsletterEmail(email)) {
    throw new Error('Invalid newsletter confirmation email')
  }

  return email
}

const resendRequest = async (
  path: string,
  options: ResendRequestOptions = {},
): Promise<unknown> => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const { allowStatuses = [], ...requestOptions } = options
  const response = await fetch(`${RESEND_API_URL}${path}`, {
    ...requestOptions,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...requestOptions.headers,
    },
    cache: 'no-store',
  })

  const responseBody = await response.json().catch(() => null)
  if (!response.ok && !allowStatuses.includes(response.status)) {
    throw new Error(`Resend request failed with status ${response.status}`)
  }

  return responseBody
}

export const sendNewsletterConfirmationEmail = async ({
  email,
  confirmationUrl,
}: {
  email: string
  confirmationUrl: string
}): Promise<void> => {
  const fromAddress = process.env.RESEND_FROM_ADDRESS
  if (!fromAddress) throw new Error('RESEND_FROM_ADDRESS is not configured')

  const fromName = process.env.RESEND_FROM_NAME || 'Nabea'
  const from = `${fromName} <${fromAddress}>`
  const subject = 'Bitte bestätige deine Newsletter-Anmeldung'
  const text = [
    'Vielen Dank für dein Interesse an unserem Newsletter.',
    '',
    `Bitte bestätige deine Anmeldung über diesen Link: ${confirmationUrl}`,
    '',
    'Der Link ist 24 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.',
  ].join('\n')
  const html = `
    <p>Vielen Dank für dein Interesse an unserem Newsletter.</p>
    <p><a href="${confirmationUrl}">Newsletter-Anmeldung bestätigen</a></p>
    <p>Der Link ist 24 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.</p>
  `

  await resendRequest('/emails', {
    method: 'POST',
    body: JSON.stringify({
      from,
      subject,
      text,
      html,
      to: [email],
    }),
  })
}

export const subscribeNewsletterContact = async (email: string): Promise<void> => {
  const topicId = process.env.RESEND_NEWSLETTER_TOPIC_ID
  if (!topicId) throw new Error('RESEND_NEWSLETTER_TOPIC_ID is not configured')

  await resendRequest('/contacts', {
    method: 'POST',
    allowStatuses: [409],
    body: JSON.stringify({
      email,
      unsubscribed: false,
    }),
  })

  await resendRequest(`/contacts/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    body: JSON.stringify({ unsubscribed: false }),
  })

  await resendRequest(`/contacts/${encodeURIComponent(email)}/topics`, {
    method: 'PATCH',
    body: JSON.stringify([
      {
        id: topicId,
        subscription: 'opt_in',
      },
    ]),
  })
}
