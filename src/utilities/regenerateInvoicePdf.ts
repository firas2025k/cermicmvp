import type { Invoice, Media, Order } from '@/payload-types'
import type { Payload, PayloadRequest } from 'payload'

import { absoluteUrl } from '@/utilities/absoluteUrl'
import {
  createMediaPdf,
  getInvoiceVatRate,
  resolveInvoiceBuyerAddress,
  resolveOrderCouponDiscount,
  resolveOrderProductDiscountCents,
  resolvePaymentMethodLabel,
} from '@/utilities/createOrderInvoice'
import { generateInvoicePdf } from '@/utilities/generateInvoicePdf'

export type RegenerateInvoicePdfResult = {
  invoiceId: number
  invoiceNumber: string
  mediaId: number
  filename: string
}

async function loadOrderForInvoice(
  payload: Payload,
  invoice: Invoice,
  req?: PayloadRequest,
): Promise<Order | null> {
  const orderRef = invoice.order
  if (!orderRef) return null

  if (typeof orderRef === 'object') {
    // May already be populated at depth 1 without nested products — refetch depth 2.
    const id = orderRef.id
    return (await payload.findByID({
      collection: 'orders',
      id,
      depth: 2,
      overrideAccess: true,
      req,
    })) as Order
  }

  return (await payload.findByID({
    collection: 'orders',
    id: orderRef,
    depth: 2,
    overrideAccess: true,
    req,
  })) as Order
}

/**
 * Rebuild an invoice PDF from the invoice snapshot (number, dates, amounts, lines)
 * and enrich buyer/payment/coupon from the linked order. Keeps Rechnungsnummer.
 */
export async function regenerateInvoicePdf(
  payload: Payload,
  invoiceId: number,
  options?: { req?: PayloadRequest },
): Promise<RegenerateInvoicePdfResult> {
  const invoice = (await payload.findByID({
    collection: 'invoices',
    id: invoiceId,
    depth: 1,
    overrideAccess: true,
    req: options?.req,
  })) as Invoice

  if (!invoice?.number) {
    throw new Error(`Invoice ${invoiceId} not found or missing number`)
  }

  const order = await loadOrderForInvoice(payload, invoice, options?.req)
  if (!order) {
    throw new Error(`Invoice ${invoice.number}: linked order not found`)
  }

  const lineItems = (invoice.lineItems ?? [])
    .filter((item) => item && typeof item.title === 'string')
    .map((item) => ({
      title: item.title,
      variantTitle: item.variantTitle ?? null,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      unitPriceCents: typeof item.unitPriceCents === 'number' ? item.unitPriceCents : 0,
      lineTotalCents: typeof item.lineTotalCents === 'number' ? item.lineTotalCents : 0,
    }))

  if (lineItems.length === 0) {
    throw new Error(`Invoice ${invoice.number}: no line items to rebuild PDF`)
  }

  const issuedAt = invoice.issuedAt ? new Date(invoice.issuedAt) : new Date()
  if (Number.isNaN(issuedAt.getTime())) {
    throw new Error(`Invoice ${invoice.number}: invalid issuedAt`)
  }

  const vatRate = getInvoiceVatRate()
  const buyerAddress = resolveInvoiceBuyerAddress(order)
  const paymentMethodLabel = await resolvePaymentMethodLabel(payload, order)
  const productDiscountCents = resolveOrderProductDiscountCents(order)
  const { couponCode, couponDiscountCents } = resolveOrderCouponDiscount(order)

  const customerEmail =
    invoice.customerEmail?.trim() ||
    (typeof order.customerEmail === 'string' ? order.customerEmail.trim() : '') ||
    null

  const { buffer, filename } = await generateInvoicePdf({
    invoiceNumber: invoice.number,
    orderId: order.id,
    issuedAt,
    customerEmail,
    buyerAddress,
    lineItems,
    shippingCents:
      typeof invoice.shippingCents === 'number' && Number.isFinite(invoice.shippingCents)
        ? Math.max(0, Math.round(invoice.shippingCents))
        : 0,
    amountNet: Math.round(invoice.amountNet),
    amountTax: Math.round(invoice.amountTax),
    amountGross: Math.round(invoice.amountGross),
    vatRate,
    paymentMethodLabel,
    productDiscountCents,
    couponCode: couponCode || null,
    couponDiscountCents,
  })

  // Avoid filename collisions with existing media rows that still point at the old key.
  const uniqueFilename = filename.replace(/\.pdf$/i, `-${Date.now()}.pdf`)

  const media = await createMediaPdf(payload, {
    filename: uniqueFilename,
    buffer,
    alt: `Rechnung ${invoice.number}`,
    req: options?.req,
  })

  await payload.update({
    collection: 'invoices',
    id: invoice.id,
    data: {
      pdf: media.id,
    },
    overrideAccess: true,
    req: options?.req,
  })

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    mediaId: media.id,
    filename: media.filename || uniqueFilename,
  }
}

/** Returns true when the invoice PDF media URL is missing or not fetchable. */
export async function isInvoicePdfMissing(invoice: Invoice): Promise<boolean> {
  const pdf = invoice.pdf
  if (!pdf || typeof pdf !== 'object') return true

  const media = pdf as Media
  const rawUrl = media.url
  if (!rawUrl) return true

  const url = absoluteUrl(rawUrl) || rawUrl

  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return false
    // Some hosts reject HEAD — try a small GET.
    if (res.status === 405 || res.status === 501) {
      const getRes = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
      })
      return !getRes.ok
    }
    return true
  } catch {
    return true
  }
}
