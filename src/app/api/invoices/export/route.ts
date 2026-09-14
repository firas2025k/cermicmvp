import configPromise from '@payload-config'
import { checkRole } from '@/access/utilities'
import type { Media, User } from '@/payload-types'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import JSZip from 'jszip'

function parseDateParam(value: string | null, endOfDay: boolean): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

async function loadPdfBuffer(media: Media): Promise<{ filename: string; buffer: Buffer } | null> {
  if (!media.url) return null

  const res = await fetch(media.url)
  if (!res.ok) return null

  const arrayBuffer = await res.arrayBuffer()
  const filename =
    media.filename && media.filename.toLowerCase().endsWith('.pdf')
      ? media.filename
      : `${media.filename || media.id}.pdf`

  return { filename, buffer: Buffer.from(arrayBuffer) }
}

/**
 * Admin-only ZIP export of invoice PDFs in a date range.
 * GET /api/invoices/export?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || !checkRole(['admin'], user as User)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
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
    pagination: false,
    overrideAccess: true,
    sort: 'issuedAt',
  })

  const zip = new JSZip()
  let added = 0

  for (const invoice of invoices.docs) {
    const pdf = invoice.pdf
    if (!pdf || typeof pdf !== 'object') continue

    const loaded = await loadPdfBuffer(pdf as Media)
    if (!loaded) continue

    const safeName = `${invoice.number || invoice.id}-${loaded.filename}`.replace(
      /[^\w.\-]+/g,
      '_',
    )
    zip.file(safeName, new Uint8Array(loaded.buffer))
    added += 1
  }

  if (added === 0) {
    return NextResponse.json(
      { message: 'No invoice PDFs found in this date range.' },
      { status: 404 },
    )
  }

  const zipBuffer = await zip.generateAsync({ type: 'uint8array' })
  const fromLabel = searchParams.get('from')
  const toLabel = searchParams.get('to')
  const filename = `nabea-rechnungen-${fromLabel}_${toLabel}.zip`

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
