import { NextResponse } from 'next/server'

import {
  subscribeNewsletterContact,
  verifyNewsletterConfirmationToken,
} from '@/lib/newsletter'
import { getServerSideURL } from '@/utilities/getURL'

const getResultUrl = (status: 'error' | 'invalid' | 'success'): string =>
  `${getServerSideURL()}/newsletter/confirmed?status=${status}`

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(getResultUrl('invalid'))
  }

  let email: string
  try {
    email = verifyNewsletterConfirmationToken(token)
  } catch {
    return NextResponse.redirect(getResultUrl('invalid'))
  }

  try {
    await subscribeNewsletterContact(email)
    return NextResponse.redirect(getResultUrl('success'))
  } catch (error) {
    console.error('[newsletter] Confirmation request failed:', error)
    return NextResponse.redirect(getResultUrl('error'))
  }
}
