import configPromise from '@payload-config'
import { checkRole } from '@/access/utilities'
import type { Media, User } from '@/payload-types'
import { absoluteUrl } from '@/utilities/absoluteUrl'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import JSZip from 'jszip'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function parseDateParam(value: string | null, endOfDay: boolean): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

async function loadPdfBuffer(media: Media): Promise<{ filename: string; bytes: Uint8Array } | null> {
  const rawUrl = media.url
  if (!rawUrl) return null

  const url = absoluteUrl(rawUrl) || rawUrl

  try {
    const res = await fetch(url)
    if (!res.ok) return null

    const arrayBuffer = await res.arrayBuffer()
    const filename =
      media.filename && media.filename.toLowerCase().endsWith('.pdf')
        ? media.filename
        : `${media.filename || media.id}.pdf`

    return { filename, bytes: new Uint8Array(arrayBuffer) }
  } catch {
    return null
  }
}

/**
 * Admin-only ZIP export of invoice PDFs in a date range.
 * GET /api/invoices/export?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || !checkRole(['admin'], user as User)) {
      return NextResponse.json({ message: 'Unauthorized — log in as admin and try again.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = parseDateParam(searchParams.get('from'), false)
    const to = parseDateParam(searchParams.get('to'), true)

    if (!from || !to) {
      return NextResponse.json(
        { message: 'Query params from and to are required as YYYY-MM-DD.' },
        { status: 400 },
      )
    }

    if (from > to) {
      return NextResponse.json({ message: 'from must be on or before to.' }, { status: 400 })
    }

    const invoices = await payload.find({
      collection: 'invoices',
      where: {
        and: [
          { issuedAt: { greater_than_equal: from.toISOString() } },
          { issuedAt: { less_than_equal: to.toISOString() } },
        ],
      },
      depth: 1,
      limit: 500,
      overrideAccess: true,
      sort: 'issuedAt',
    })

    const zip = new JSZip()
    let added = 0
    const failures: string[] = []

    for (const invoice of invoices.docs) {
      const pdf = invoice.pdf
      if (!pdf || typeof pdf !== 'object') {
        failures.push(`${invoice.number || invoice.id}: missing PDF`)
        continue
      }

      const loaded = await loadPdfBuffer(pdf as Media)
      if (!loaded) {
        failures.push(`${invoice.number || invoice.id}: could not fetch PDF file`)
        continue
      }

      const safeName = `${invoice.number || invoice.id}-${loaded.filename}`.replace(
        /[^\w.\-]+/g,
        '_',
      )
      zip.file(safeName, loaded.bytes)
      added += 1
    }

    if (added === 0) {
      return NextResponse.json(
        {
          message:
            invoices.docs.length === 0
              ? 'No invoices found in this date range.'
              : `Found ${invoices.docs.length} invoice(s) but no downloadable PDFs. Use “Regenerate missing PDFs” on the Invoices list, then export again.`,
          failures,
        },
        { status: 404 },
      )
    }

    const zipBytes = await zip.generateAsync({ type: 'uint8array' })
    const fromLabel = searchParams.get('from')
    const toLabel = searchParams.get('to')
    const filename = `nabea-rechnungen-${fromLabel}_${toLabel}.zip`

    // ASCII-safe summary for the admin panel (comma-separated invoice numbers).
    const failureSummary = failures
      .map((entry) => entry.split(':')[0]?.trim() || entry)
      .filter(Boolean)
      .slice(0, 20)
      .join(', ')

    return new NextResponse(Buffer.from(zipBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-Invoice-Export-Packed': String(added),
        'X-Invoice-Export-Total': String(invoices.docs.length),
        ...(failureSummary
          ? { 'X-Invoice-Export-Failures': encodeURIComponent(failureSummary) }
          : {}),
      },
    })
  } catch (err) {
    console.error('[api/invoices/export]', err)
    const message = err instanceof Error ? err.message : 'Export failed.'
    return NextResponse.json({ message }, { status: 500 })
  }
}
