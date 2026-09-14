import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import { formatEUR } from '@/utilities/formatEUR'

export type InvoicePdfLineItem = {
  title: string
  variantTitle?: string | null
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export type InvoicePdfAddress = {
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  postalCode?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

export type GenerateInvoicePdfInput = {
  invoiceNumber: string
  orderId: number
  issuedAt: Date
  customerEmail?: string | null
  /** Rechnungsempfänger: billing when available, otherwise shipping. */
  buyerAddress?: InvoicePdfAddress | null
  lineItems: InvoicePdfLineItem[]
  shippingCents: number
  amountNet: number
  amountTax: number
  amountGross: number
  vatRate: number
  /** e.g. "Kreditkarte" or "Online-Zahlung (Stripe)" */
  paymentMethodLabel?: string | null
}

/** Client-confirmed seller block for Austrian Rechnung. */
export const INVOICE_SELLER_LINES = [
  'NABEA e.U.',
  'Amir Tabib',
  'Jasmingasse 1a/2',
  '2230 Gänserndorf',
  'Austria',
  'FN 680429g',
  'LG Korneuburg',
]

const formatDateDe = (date: Date): string =>
  date.toLocaleDateString('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const formatMoney = (cents: number): string => formatEUR(cents).replace(/\u00A0/g, ' ')

const buyerLines = (input: GenerateInvoicePdfInput): string[] => {
  const a = input.buyerAddress
  if (!a) {
    return input.customerEmail ? [input.customerEmail] : ['—']
  }

  return [
    [a.firstName, a.lastName].filter(Boolean).join(' '),
    a.company,
    a.addressLine1,
    a.addressLine2,
    [a.postalCode, a.city].filter(Boolean).join(' '),
    a.state,
    a.country,
    input.customerEmail,
  ].filter((line): line is string => Boolean(line?.trim()))
}

const lineLabel = (item: InvoicePdfLineItem): string => {
  const title = item.title.trim() || 'Produkt'
  const variant = item.variantTitle?.trim()
  return variant ? `${title} – ${variant}` : title
}

export function formatInvoiceShippingLabel(shippingCents: number): string {
  if (shippingCents === 0) return 'Versandkosten: Kostenlos'
  return `Versandkosten: ${formatMoney(shippingCents)}`
}

/** Builds an Austrian Rechnung PDF; returns PDF bytes and suggested filename. */
export async function generateInvoicePdf(
  input: GenerateInvoicePdfInput,
): Promise<{ buffer: Buffer; filename: string }> {
  const uid = process.env.INVOICE_SELLER_UID?.trim() || ''
  const vatPercent = Math.round(input.vatRate * 100)
  const paymentLabel =
    input.paymentMethodLabel?.trim() || 'Online-Zahlung (Stripe)'

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const margin = 48
  const pageWidth = page.getWidth()
  let y = page.getHeight() - margin

  const drawText = (
    text: string,
    x: number,
    atY: number,
    options?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> },
  ) => {
    const size = options?.size ?? 10
    const usedFont = options?.bold ? fontBold : font
    page.drawText(text, {
      x,
      y: atY,
      size,
      font: usedFont,
      color: options?.color ?? rgb(0.17, 0.16, 0.15),
    })
  }

  drawText('RECHNUNG', margin, y, { size: 18, bold: true })
  y -= 28

  drawText('Verkäufer', margin, y, { size: 11, bold: true })
  y -= 14
  for (const line of INVOICE_SELLER_LINES) {
    drawText(line, margin, y, { size: 9 })
    y -= 12
  }
  if (uid) {
    drawText(`UID: ${uid}`, margin, y, { size: 9 })
    y -= 12
  }

  y -= 8
  drawText('Rechnungsempfänger', margin, y, { size: 11, bold: true })
  y -= 14
  for (const line of buyerLines(input)) {
    drawText(line, margin, y, { size: 9 })
    y -= 12
  }

  y -= 10
  drawText(`Rechnungsnummer: ${input.invoiceNumber}`, margin, y, { size: 10, bold: true })
  y -= 14
  drawText(`Bestellnummer: #${input.orderId}`, margin, y, { size: 10 })
  y -= 14
  drawText(`Rechnungsdatum: ${formatDateDe(input.issuedAt)}`, margin, y, { size: 10 })
  y -= 24

  // Table header
  const colArtikel = margin
  const colMenge = pageWidth - margin - 180
  const colPreis = pageWidth - margin - 90
  const colBetrag = pageWidth - margin

  drawText('Artikel', colArtikel, y, { size: 9, bold: true })
  drawText('Menge', colMenge, y, { size: 9, bold: true })
  drawText('Preis', colPreis, y, { size: 9, bold: true })
  const betragHeader = 'Betrag'
  drawText(betragHeader, colBetrag - fontBold.widthOfTextAtSize(betragHeader, 9), y, {
    size: 9,
    bold: true,
  })
  y -= 6
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.68, 0.65),
  })
  y -= 14

  for (const item of input.lineItems) {
    if (y < 140) {
      drawText('…', colArtikel, y, { size: 9 })
      y -= 14
      break
    }

    const label = lineLabel(item)
    const truncated = label.length > 55 ? `${label.slice(0, 52)}…` : label
    drawText(truncated, colArtikel, y, { size: 9 })
    drawText(String(item.quantity), colMenge, y, { size: 9 })
    const unit = formatMoney(item.unitPriceCents)
    drawText(unit, colPreis, y, { size: 9 })
    const total = formatMoney(item.lineTotalCents)
    drawText(total, colBetrag - font.widthOfTextAtSize(total, 9), y, { size: 9 })
    y -= 14
  }

  y -= 8
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.68, 0.65),
  })
  y -= 18

  const summaryLines = [
    formatInvoiceShippingLabel(input.shippingCents),
    `Gesamtbetrag: ${formatMoney(input.amountGross)}`,
    `darin enthaltene MwSt. (${vatPercent}%): ${formatMoney(input.amountTax)}`,
  ]

  for (let i = 0; i < summaryLines.length; i++) {
    const line = summaryLines[i]!
    const isTotal = i === 1
    drawText(line, pageWidth - margin - font.widthOfTextAtSize(line, isTotal ? 11 : 10), y, {
      size: isTotal ? 11 : 10,
      bold: isTotal,
    })
    y -= isTotal ? 16 : 14
  }

  y -= 20
  drawText(`Zahlungsart: ${paymentLabel}`, margin, y, { size: 9 })
  y -= 12
  drawText('Zahlungsstatus: Bezahlt', margin, y, { size: 9 })
  y -= 12
  drawText('Vielen Dank für Ihren Einkauf bei NABEA.', margin, y, { size: 9 })

  const bytes = await pdf.save()
  const buffer = Buffer.from(bytes)
  const filename = `Rechnung-${input.invoiceNumber}.pdf`
  return { buffer, filename }
}
