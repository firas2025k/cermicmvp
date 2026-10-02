import type { Invoice, Media, Order, Product, Transaction, User, Variant } from '@/payload-types'
import type { Payload, PayloadRequest } from 'payload'
import Stripe from 'stripe'

import { absoluteUrl } from '@/utilities/absoluteUrl'
import {
  generateInvoicePdf,
  type InvoicePdfAddress,
} from '@/utilities/generateInvoicePdf'

export type InvoiceLineSnapshot = {
  title: string
  variantTitle?: string | null
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
  imageUrl?: string | null
}

export type CreateOrderInvoiceResult = {
  invoice: Invoice
  pdfBuffer: Buffer
  pdfFilename: string
}

const DEFAULT_VAT_RATE = 0.2

function resolveCustomerEmail(order: Order): string | null {
  if (order.customerEmail?.trim()) {
    return order.customerEmail.trim().toLowerCase()
  }
  if (order.customer && typeof order.customer === 'object') {
    const email = (order.customer as User).email?.trim()
    if (email) return email.toLowerCase()
  }
  return null
}

export function getInvoiceVatRate(): number {
  const raw = process.env.INVOICE_VAT_RATE
  if (!raw) return DEFAULT_VAT_RATE
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_VAT_RATE
}

/** Reverse-calc Netto / MwSt from brutto (inkl. VAT). */
export function splitGrossAmount(
  grossCents: number,
  vatRate: number = getInvoiceVatRate(),
): { amountNet: number; amountTax: number; amountGross: number } {
  const amountGross = Math.max(0, Math.round(grossCents))
  const amountNet = Math.round(amountGross / (1 + vatRate))
  const amountTax = amountGross - amountNet
  return { amountNet, amountTax, amountGross }
}

function mediaAbsoluteUrl(media: Media | null | undefined): string | undefined {
  if (!media?.url) return undefined
  return absoluteUrl(media.url)
}

function resolveProductImageUrl(product: Product | null): string | undefined {
  if (!product) return undefined

  const galleryImage = product.gallery?.[0]?.image
  if (galleryImage && typeof galleryImage === 'object') {
    const url = mediaAbsoluteUrl(galleryImage)
    if (url) return url
  }

  const metaImage = product.meta?.image
  if (metaImage && typeof metaImage === 'object') {
    return mediaAbsoluteUrl(metaImage)
  }

  return undefined
}

export function buildInvoiceLineSnapshots(order: Order): InvoiceLineSnapshot[] {
  if (!order.items?.length) return []

  return order.items.map((item) => {
    const product =
      item.product && typeof item.product === 'object' ? (item.product as Product) : null
    const variant =
      item.variant && typeof item.variant === 'object' ? (item.variant as Variant) : null

    const quantity = item.quantity ?? 1
    const unitPriceCents = Math.round(
      typeof variant?.priceInEUR === 'number'
        ? variant.priceInEUR
        : typeof product?.priceInEUR === 'number'
          ? product.priceInEUR
          : 0,
    )

    return {
      title: product?.title?.trim() || 'Produkt',
      variantTitle: variant?.title?.trim() || null,
      quantity,
      unitPriceCents,
      lineTotalCents: unitPriceCents * quantity,
      imageUrl: resolveProductImageUrl(product) ?? null,
    }
  })
}

/**
 * Product sale savings vs compare-at at invoice time (cents).
 * Line items already use the charged (sale) price; this is the list-price delta.
 */
export function resolveOrderProductDiscountCents(order: Order): number {
  if (!order.items?.length) return 0

  let total = 0
  for (const item of order.items) {
    const product =
      item.product && typeof item.product === 'object' ? (item.product as Product) : null
    const variant =
      item.variant && typeof item.variant === 'object' ? (item.variant as Variant) : null
    const quantity = item.quantity ?? 1

    const chargeCents = Math.round(
      typeof variant?.priceInEUR === 'number'
        ? variant.priceInEUR
        : typeof product?.priceInEUR === 'number'
          ? product.priceInEUR
          : 0,
    )
    const compareAtCents = Math.round(
      typeof variant?.compareAtPriceInEUR === 'number'
        ? variant.compareAtPriceInEUR
        : typeof product?.compareAtPriceInEUR === 'number'
          ? product.compareAtPriceInEUR
          : 0,
    )

    if (compareAtCents > chargeCents && chargeCents >= 0) {
      total += (compareAtCents - chargeCents) * quantity
    }
  }

  return Math.max(0, total)
}

export function resolveOrderCouponDiscount(order: Order): {
  couponCode: string
  couponDiscountCents: number
} {
  const couponCode =
    typeof order.couponCode === 'string' && order.couponCode.trim() ? order.couponCode.trim() : ''
  const couponDiscountCents =
    typeof order.couponDiscountCents === 'number' && Number.isFinite(order.couponDiscountCents)
      ? Math.max(0, Math.round(order.couponDiscountCents))
      : 0
  return { couponCode, couponDiscountCents }
}

function addressHasStreet(address?: InvoicePdfAddress | null): boolean {
  return Boolean(address?.addressLine1?.trim())
}

/** Prefer transaction billing address when present; otherwise shipping. */
export function resolveInvoiceBuyerAddress(order: Order): InvoicePdfAddress | null {
  const transactions = order.transactions
  if (Array.isArray(transactions)) {
    for (const entry of transactions) {
      if (entry && typeof entry === 'object') {
        const billing = (entry as Transaction).billingAddress
        if (addressHasStreet(billing) && billing) {
          return billing
        }
      }
    }
  }

  return order.shippingAddress ?? null
}

function getRelatedPaymentIntentId(order: Order): string | null {
  const transactions = order.transactions
  if (!Array.isArray(transactions)) return null

  for (const entry of transactions) {
    if (entry && typeof entry === 'object') {
      const id = (entry as Transaction).stripe?.paymentIntentID?.trim()
      if (id) return id
    }
  }
  return null
}

/** Map Stripe payment_method.type to German invoice label. */
export function mapStripePaymentMethodLabel(type: string | null | undefined): string {
  switch (type) {
    case 'card':
      return 'Kreditkarte'
    case 'klarna':
      return 'Klarna'
    case 'eps':
      return 'EPS'
    case 'paypal':
      return 'PayPal'
    case 'apple_pay':
      return 'Apple Pay'
    case 'google_pay':
      return 'Google Pay'
    default:
      return 'Online-Zahlung (Stripe)'
  }
}

export async function resolvePaymentMethodLabel(
  payload: Payload,
  order: Order,
): Promise<string> {
  const paymentIntentID = getRelatedPaymentIntentId(order)
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!paymentIntentID || !secretKey) {
    return 'Online-Zahlung (Stripe)'
  }

  try {
    const stripe = new Stripe(secretKey, {
      // @ts-expect-error Stripe API version string varies by SDK release
      apiVersion: '2025-03-31.basil',
    })
    const pi = await stripe.paymentIntents.retrieve(paymentIntentID, {
      expand: ['payment_method'],
    })

    const pm = pi.payment_method
    if (pm && typeof pm === 'object' && 'type' in pm) {
      // Wallet cards often report type "card" with card.wallet
      const card = 'card' in pm ? pm.card : null
      const walletType =
        card && typeof card === 'object' && card && 'wallet' in card
          ? (card.wallet as { type?: string } | null)?.type
          : undefined
      if (walletType === 'apple_pay') return mapStripePaymentMethodLabel('apple_pay')
      if (walletType === 'google_pay') return mapStripePaymentMethodLabel('google_pay')
      return mapStripePaymentMethodLabel(pm.type)
    }

    if (typeof pi.payment_method_types?.[0] === 'string') {
      return mapStripePaymentMethodLabel(pi.payment_method_types[0])
    }
  } catch (err) {
    payload.logger.warn(
      { err, orderId: order.id, paymentIntentID },
      '[invoices] Could not resolve Stripe payment method — using fallback label',
    )
  }

  return 'Online-Zahlung (Stripe)'
}

function nextSequenceFromNumbers(numbers: string[], year: number): number {
  const prefix = `NABEA-${year}-`
  let max = 0
  for (const value of numbers) {
    if (!value.startsWith(prefix)) continue
    const seq = Number.parseInt(value.slice(prefix.length), 10)
    if (Number.isFinite(seq) && seq > max) max = seq
  }
  return max + 1
}

export function formatInvoiceNumber(year: number, sequence: number): string {
  return `NABEA-${year}-${String(sequence).padStart(4, '0')}`
}

async function allocateInvoiceNumber(payload: Payload, year: number): Promise<string> {
  const prefix = `NABEA-${year}-`
  const result = await payload.find({
    collection: 'invoices',
    where: {
      number: {
        like: `${prefix}%`,
      },
    },
    sort: '-number',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  const numbers = result.docs.map((doc) => doc.number).filter(Boolean)
  const sequence = nextSequenceFromNumbers(numbers, year)
  return formatInvoiceNumber(year, sequence)
}

export async function createMediaPdf(
  payload: Payload,
  args: { filename: string; buffer: Buffer; alt: string; req?: PayloadRequest },
): Promise<Media> {
  return (await payload.create({
    collection: 'media',
    data: {
      alt: args.alt,
    },
    file: {
      name: args.filename,
      data: args.buffer,
      mimetype: 'application/pdf',
      size: args.buffer.byteLength,
    },
    overrideAccess: true,
    req: args.req,
  })) as Media
}

/**
 * Allocates invoice number, builds PDF, stores Media + invoices doc.
 * Call with a depth-2 order (product/variant/gallery populated).
 */
export async function createOrderInvoice(
  payload: Payload,
  order: Order,
  options?: { req?: PayloadRequest },
): Promise<CreateOrderInvoiceResult> {
  const issuedAt = new Date()
  const year = issuedAt.getFullYear()
  const vatRate = getInvoiceVatRate()
  const lineItems = buildInvoiceLineSnapshots(order)
  const shippingCents =
    typeof order.shippingAmount === 'number' && Number.isFinite(order.shippingAmount)
      ? Math.max(0, Math.round(order.shippingAmount))
      : 0
  const productDiscountCents = resolveOrderProductDiscountCents(order)
  const { couponCode, couponDiscountCents } = resolveOrderCouponDiscount(order)
  const { amountNet, amountTax, amountGross } = splitGrossAmount(
    typeof order.amount === 'number' ? order.amount : 0,
    vatRate,
  )
  const customerEmail = resolveCustomerEmail(order)
  const buyerAddress = resolveInvoiceBuyerAddress(order)
  const paymentMethodLabel = await resolvePaymentMethodLabel(payload, order)

  const attemptCreate = async (invoiceNumber: string): Promise<CreateOrderInvoiceResult> => {
    const { buffer, filename } = await generateInvoicePdf({
      invoiceNumber,
      orderId: order.id,
      issuedAt,
      customerEmail,
      buyerAddress,
      lineItems,
      shippingCents,
      amountNet,
      amountTax,
      amountGross,
      vatRate,
      paymentMethodLabel,
      productDiscountCents,
      couponCode: couponCode || null,
      couponDiscountCents,
    })

    const media = await createMediaPdf(payload, {
      filename,
      buffer,
      alt: `Rechnung ${invoiceNumber}`,
      req: options?.req,
    })

    const invoice = (await payload.create({
      collection: 'invoices',
      data: {
        number: invoiceNumber,
        order: order.id,
        customerEmail: customerEmail || undefined,
        issuedAt: issuedAt.toISOString(),
        currency: 'EUR',
        amountGross,
        amountNet,
        amountTax,
        shippingCents,
        lineItems: lineItems.map((item) => ({
          title: item.title,
          variantTitle: item.variantTitle || undefined,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineTotalCents: item.lineTotalCents,
          imageUrl: item.imageUrl || undefined,
        })),
        pdf: media.id,
      },
      overrideAccess: true,
      req: options?.req,
    })) as Invoice

    return { invoice, pdfBuffer: buffer, pdfFilename: filename }
  }

  const firstNumber = await allocateInvoiceNumber(payload, year)

  try {
    return await attemptCreate(firstNumber)
  } catch (err) {
    // Unique constraint race: allocate again and retry once.
    const message = err instanceof Error ? err.message : String(err)
    const isUniqueConflict =
      message.toLowerCase().includes('unique') ||
      message.toLowerCase().includes('duplicate') ||
      (typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === '23505')

    if (!isUniqueConflict) throw err

    payload.logger.warn(
      { err, orderId: order.id, invoiceNumber: firstNumber },
      '[invoices] Number conflict — retrying allocation',
    )

    const retryNumber = await allocateInvoiceNumber(payload, year)
    if (retryNumber === firstNumber) {
      // Force bump if find still returns same (race window)
      const bumped = formatInvoiceNumber(
        year,
        Number.parseInt(firstNumber.split('-').pop() || '0', 10) + 1,
      )
      return await attemptCreate(bumped)
    }
    return await attemptCreate(retryNumber)
  }
}
