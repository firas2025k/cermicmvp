import configPromise from '@payload-config'
import { checkRole } from '@/access/utilities'
import type { Invoice, User } from '@/payload-types'
import {
  isInvoicePdfMissing,
  regenerateInvoicePdf,
} from '@/utilities/regenerateInvoicePdf'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Body = {
  id?: number
  missingOnly?: boolean
}

/**
 * Admin-only: regenerate invoice PDF(s) from Neon snapshot + linked order.
 * POST { id: number } | { missingOnly: true }
 */
export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || !checkRole(['admin'], user as User)) {
      return NextResponse.json(
        { message: 'Unauthorized — log in as admin and try again.' },
        { status: 401 },
      )
    }

    let body: Body = {}
    try {
      body = (await request.json()) as Body
    } catch {
      body = {}
    }

    const id =
      typeof body.id === 'number' && Number.isFinite(body.id) ? Math.trunc(body.id) : null
    const missingOnly = body.missingOnly === true

    if (!id && !missingOnly) {
      return NextResponse.json(
        { message: 'Provide { id } or { missingOnly: true }.' },
        { status: 400 },
      )
    }

    if (id) {
      try {
        const result = await regenerateInvoicePdf(payload, id)
        return NextResponse.json({
          message: `Regenerated ${result.invoiceNumber}.`,
          regenerated: [result],
          failures: [],
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Regenerate failed.'
        return NextResponse.json({ message, failures: [message] }, { status: 500 })
      }
    }

    const invoices = await payload.find({
      collection: 'invoices',
      depth: 1,
      limit: 500,
      overrideAccess: true,
      sort: 'issuedAt',
    })

    const regenerated: Awaited<ReturnType<typeof regenerateInvoicePdf>>[] = []
    const failures: string[] = []
    let skipped = 0

    for (const doc of invoices.docs) {
      const invoice = doc as Invoice
      const missing = await isInvoicePdfMissing(invoice)
      if (!missing) {
        skipped += 1
        continue
      }

      try {
        const result = await regenerateInvoicePdf(payload, invoice.id)
        regenerated.push(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        failures.push(`${invoice.number || invoice.id}: ${message}`)
        payload.logger.error(
          { err, invoiceId: invoice.id },
          '[api/invoices/regenerate] Failed for invoice',
        )
      }
    }

    return NextResponse.json({
      message:
        regenerated.length === 0 && failures.length === 0
          ? `No missing PDFs — checked ${invoices.docs.length} invoice(s).`
          : `Regenerated ${regenerated.length} PDF(s); skipped ${skipped} present; ${failures.length} failed.`,
      regenerated,
      failures,
      skipped,
      checked: invoices.docs.length,
    })
  } catch (err) {
    console.error('[api/invoices/regenerate]', err)
    const message = err instanceof Error ? err.message : 'Regenerate failed.'
    return NextResponse.json({ message }, { status: 500 })
  }
}
