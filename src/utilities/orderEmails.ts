import type { Order, Product, User, Variant } from '@/payload-types'
import type { Payload, PayloadRequest } from 'payload'

import { createOrderInvoice, buildInvoiceLineSnapshots, resolveOrderCouponDiscount, resolveOrderProductDiscountCents, type InvoiceLineSnapshot } from '@/utilities/createOrderInvoice'
import { absoluteUrl } from '@/utilities/absoluteUrl'
import { formatEUR } from '@/utilities/formatEUR'

export type OrderLineItem = {
  title: string
  variantTitle?: string | null
  quantity: number
  unitPriceCents?: number
  lineTotalCents?: number
  imageUrl?: string | null
}

export type OrderEmailContext = {
  orderId: number
  createdAt: string
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  items: OrderLineItem[]
  shippingAddress?: Order['shippingAddress']
  amountCents: number
  shippingCents: number
  invoiceNumber?: string | null
  productDiscountCents?: number
  couponCode?: string | null
  couponDiscountCents?: number
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const getOrderNotificationAdminEmail = (): string =>
  process.env.ORDER_NOTIFICATION_TO ||
  process.env.STOCK_NOTIFICATION_TO ||
  process.env.RESEND_FROM_ADDRESS ||
  'contact@nabea.at'

export const hasOrderEmailConfig = (): boolean => Boolean(process.env.RESEND_API_KEY)

const wrapEmail = (title: string, bodyHtml: string): string => `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F8F4EE;font-family:Georgia,'Times New Roman',serif;color:#2C2A27;">
    <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
      <p style="margin:0 0 24px;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#4A5E3A;">NABEA</p>
      ${bodyHtml}
    </div>
  </body>
</html>
`

const customerSignatureText = (): string =>
  [
    'Freundliche Grüße',
    '',
    'NABEA e.U.',
    'Amir Tabib',
    'contact@nabea.at',
    '',
    'Gänserndorf',
    'FN 680429g',
    'LG Korneuburg',
  ].join('\n')

const customerSignatureHtml = (): string => `
  <p style="margin:24px 0 0;font-size:16px;line-height:1.6;">Freundliche Grüße</p>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.7;">
    NABEA e.U.<br />
    Amir Tabib<br />
    <a href="mailto:contact@nabea.at" style="color:#4A5E3A;">contact@nabea.at</a>
  </p>
  <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#8C8680;">
    Gänserndorf<br />
    FN 680429g<br />
    LG Korneuburg
  </p>
`

const greetingLine = (ctx: OrderEmailContext): string => {
  const vorname = ctx.customerFirstName?.trim()
  return vorname ? `Hallo ${vorname},` : 'Hallo,'
}

const formatOrderDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

const adminOrderUrl = (orderId: number): string | undefined =>
  absoluteUrl(`/admin/collections/orders/${orderId}`)

const lineLabel = (item: OrderLineItem): string => {
  const title = item.title.trim() || 'Produkt'
  const variant = item.variantTitle?.trim()
  return variant ? `${title} – ${variant}` : title
}

const formatAddressText = (address: NonNullable<Order['shippingAddress']>): string => {
  const lines = [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.company,
    address.addressLine1,
    address.addressLine2,
    [address.postalCode, address.city].filter(Boolean).join(' '),
    address.state,
    address.country,
    address.phone ? `Tel: ${address.phone}` : null,
  ].filter((line): line is string => Boolean(line?.trim()))
  return lines.join('\n')
}

const formatAddressHtml = (address: NonNullable<Order['shippingAddress']>): string =>
  escapeHtml(formatAddressText(address)).replace(/\n/g, '<br />')

const itemsText = (items: OrderLineItem[]): string =>
  items
    .map((item) => {
      const price =
        typeof item.lineTotalCents === 'number' ? ` — ${formatEUR(item.lineTotalCents)}` : ''
      return `• ${item.quantity}× ${lineLabel(item)}${price}`
    })
    .join('\n') || '• —'

const lineSubtotalCents = (items: OrderLineItem[]): number =>
  items.reduce((sum, item) => {
    if (typeof item.lineTotalCents === 'number') return sum + item.lineTotalCents
    return sum
  }, 0)

const shippingLabel = (shippingCents: number): string =>
  shippingCents === 0 ? 'Kostenlos' : formatEUR(shippingCents)

const orderItemsTableHtml = (ctx: OrderEmailContext): string => {
  const rows =
    ctx.items.length > 0
      ? ctx.items
          .map((item) => {
            const img = item.imageUrl
              ? `<img src="${escapeHtml(item.imageUrl)}" alt="" width="56" height="56" style="display:block;width:56px;height:56px;object-fit:cover;border:0;" />`
              : `<div style="width:56px;height:56px;background:#E8E2D9;"></div>`
            const price =
              typeof item.lineTotalCents === 'number' ? formatEUR(item.lineTotalCents) : '—'
            return `
              <tr>
                <td style="padding:10px 8px 10px 0;vertical-align:middle;width:64px;">${img}</td>
                <td style="padding:10px 8px;vertical-align:middle;font-family:system-ui,sans-serif;font-size:14px;line-height:1.4;">
                  ${escapeHtml(lineLabel(item))}
                </td>
                <td style="padding:10px 8px;vertical-align:middle;text-align:center;font-family:system-ui,sans-serif;font-size:14px;">
                  ${escapeHtml(String(item.quantity))}
                </td>
                <td style="padding:10px 0 10px 8px;vertical-align:middle;text-align:right;font-family:system-ui,sans-serif;font-size:14px;white-space:nowrap;">
                  ${escapeHtml(price)}
                </td>
              </tr>`
          })
          .join('')
      : `<tr><td colspan="4" style="padding:10px 0;font-family:system-ui,sans-serif;font-size:14px;">—</td></tr>`

  const subtotal = lineSubtotalCents(ctx.items)
  const productDiscountCents = Math.max(0, Math.round(ctx.productDiscountCents || 0))
  const couponDiscountCents = Math.max(0, Math.round(ctx.couponDiscountCents || 0))
  const couponCode = ctx.couponCode?.trim() || ''
  const listSubtotal = subtotal + productDiscountCents
  const subtotalDisplay =
    listSubtotal > 0
      ? formatEUR(listSubtotal)
      : formatEUR(Math.max(0, ctx.amountCents - ctx.shippingCents + couponDiscountCents))

  const discountRows = [
    productDiscountCents > 0
      ? `<tr>
        <td style="padding:2px 0;">Aktionsrabatt</td>
        <td align="right" style="padding:2px 0;">−${escapeHtml(formatEUR(productDiscountCents))}</td>
      </tr>`
      : '',
    couponDiscountCents > 0
      ? `<tr>
        <td style="padding:2px 0;">Gutschein${couponCode ? ` (${escapeHtml(couponCode)})` : ''}</td>
        <td align="right" style="padding:2px 0;">−${escapeHtml(formatEUR(couponDiscountCents))}</td>
      </tr>`
      : '',
  ].join('')

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 16px;">
      <thead>
        <tr>
          <th align="left" style="padding:0 8px 8px 0;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;color:#8C8680;border-bottom:1px solid #E8E2D9;">&nbsp;</th>
          <th align="left" style="padding:0 8px 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;color:#8C8680;border-bottom:1px solid #E8E2D9;">Artikel</th>
          <th align="center" style="padding:0 8px 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;color:#8C8680;border-bottom:1px solid #E8E2D9;">Menge</th>
          <th align="right" style="padding:0 0 8px 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;color:#8C8680;border-bottom:1px solid #E8E2D9;">Preis</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;">
      <tr>
        <td style="padding:2px 0;">Zwischensumme</td>
        <td align="right" style="padding:2px 0;">${escapeHtml(subtotalDisplay)}</td>
      </tr>
      ${discountRows}
      <tr>
        <td style="padding:2px 0;">Versandkosten</td>
        <td align="right" style="padding:2px 0;">${escapeHtml(shippingLabel(ctx.shippingCents))}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 2px;font-weight:700;">Gesamtbetrag</td>
        <td align="right" style="padding:8px 0 2px;font-weight:700;">${escapeHtml(formatEUR(ctx.amountCents))}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0;font-size:12px;color:#8C8680;">inkl. MwSt.</td>
      </tr>
    </table>
  `
}

export function buildCustomerOrderConfirmationEmail(ctx: OrderEmailContext): {
  subject: string
  html: string
  text: string
} {
  const subject = `Bestellbestätigung – ${ctx.orderId}`
  const greeting = greetingLine(ctx)
  const date = formatOrderDate(ctx.createdAt)
  const address = ctx.shippingAddress
  const subtotal = lineSubtotalCents(ctx.items)
  const productDiscountCents = Math.max(0, Math.round(ctx.productDiscountCents || 0))
  const couponDiscountCents = Math.max(0, Math.round(ctx.couponDiscountCents || 0))
  const couponCode = ctx.couponCode?.trim() || ''
  const listSubtotal = subtotal + productDiscountCents
  const subtotalDisplay =
    listSubtotal > 0
      ? formatEUR(listSubtotal)
      : formatEUR(Math.max(0, ctx.amountCents - ctx.shippingCents + couponDiscountCents))

  const text = [
    greeting,
    '',
    'vielen Dank für Ihre Bestellung bei NABEA. Wir haben Ihre Bestellung erhalten und bereiten sie nun für den Versand vor.',
    '',
    `Bestellnummer: ${ctx.orderId}`,
    `Bestelldatum: ${date}`,
    ctx.invoiceNumber ? `Rechnungsnummer: ${ctx.invoiceNumber}` : null,
    '',
    'Ihre Bestellung',
    itemsText(ctx.items),
    '',
    `Zwischensumme: ${subtotalDisplay}`,
    productDiscountCents > 0 ? `Aktionsrabatt: −${formatEUR(productDiscountCents)}` : null,
    couponDiscountCents > 0
      ? `Gutschein${couponCode ? ` (${couponCode})` : ''}: −${formatEUR(couponDiscountCents)}`
      : null,
    `Versandkosten: ${shippingLabel(ctx.shippingCents)}`,
    `Gesamtbetrag: ${formatEUR(ctx.amountCents)}`,
    'inkl. MwSt.',
    '',
    address ? 'Lieferadresse' : null,
    address ? '' : null,
    address ? formatAddressText(address) : null,
    address ? '' : null,
    'Ihre Rechnung befindet sich im Anhang dieser E-Mail.',
    '',
    'Sobald Ihre Bestellung versendet wurde, erhalten Sie eine weitere E-Mail mit den Informationen zu Ihrer Sendung.',
    '',
    'Wir wünschen Ihnen viel Freude mit Ihrer Bestellung.',
    '',
    customerSignatureText(),
  ]
    .filter((line) => line !== null)
    .join('\n')

  const html = wrapEmail(
    subject,
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        vielen Dank für Ihre Bestellung bei NABEA. Wir haben Ihre Bestellung erhalten und bereiten sie nun für den Versand vor.
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
        <strong>Bestellnummer:</strong> ${ctx.orderId}<br />
        <strong>Bestelldatum:</strong> ${escapeHtml(date)}
        ${
          ctx.invoiceNumber
            ? `<br /><strong>Rechnungsnummer:</strong> ${escapeHtml(ctx.invoiceNumber)}`
            : ''
        }
      </p>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Ihre Bestellung</strong></p>
      ${orderItemsTableHtml(ctx)}
      ${
        address
          ? `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Lieferadresse</strong></p>
             <p style="margin:0 0 16px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
               ${formatAddressHtml(address)}
             </p>`
          : ''
      }
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Ihre Rechnung befindet sich im Anhang dieser E-Mail.
      </p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Sobald Ihre Bestellung versendet wurde, erhalten Sie eine weitere E-Mail mit den Informationen zu Ihrer Sendung.
      </p>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;">
        Wir wünschen Ihnen viel Freude mit Ihrer Bestellung.
      </p>
      ${customerSignatureHtml()}
    `,
  )

  return { subject, html, text }
}

export function buildShopOrderAlertEmail(ctx: OrderEmailContext): {
  subject: string
  html: string
  text: string
} {
  const subject = `NABEA – Neue Bestellung #${ctx.orderId}`
  const total = formatEUR(ctx.amountCents)
  const date = formatOrderDate(ctx.createdAt)
  const adminUrl = adminOrderUrl(ctx.orderId)
  const address = ctx.shippingAddress

  const text = [
    `Neue Bestellung #${ctx.orderId}`,
    `Datum: ${date}`,
    `Kunde: ${ctx.customerEmail}`,
    ctx.invoiceNumber ? `Rechnung: ${ctx.invoiceNumber}` : null,
    '',
    'Artikel:',
    itemsText(ctx.items),
    '',
    address ? 'Lieferadresse:' : null,
    address ? formatAddressText(address) : null,
    address ? '' : null,
    `Gesamtbetrag: ${total}`,
    '',
    adminUrl || null,
  ]
    .filter((line) => line !== null)
    .join('\n')

  const html = wrapEmail(
    subject,
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Neue Bestellung <strong>#${ctx.orderId}</strong>
      </p>
      <ul style="margin:0 0 16px;padding-left:18px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
        <li><strong>Datum:</strong> ${escapeHtml(date)}</li>
        <li><strong>Kunde:</strong> ${escapeHtml(ctx.customerEmail)}</li>
        ${
          ctx.invoiceNumber
            ? `<li><strong>Rechnung:</strong> ${escapeHtml(ctx.invoiceNumber)}</li>`
            : ''
        }
        <li><strong>Gesamtbetrag:</strong> ${escapeHtml(total)}</li>
      </ul>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Artikel</strong></p>
      ${orderItemsTableHtml(ctx)}
      ${
        address
          ? `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Lieferadresse</strong></p>
             <p style="margin:0 0 16px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
               ${formatAddressHtml(address)}
             </p>`
          : ''
      }
      ${
        adminUrl
          ? `<p style="margin:0;">
              <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 20px;background:#2C2A27;color:#F8F4EE;text-decoration:none;font-family:system-ui,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">
                Im Admin öffnen
              </a>
            </p>`
          : ''
      }
    `,
  )

  return { subject, html, text }
}

/** Customer-facing status values that trigger a transactional email on change. */
export type NotifiableOrderStatus = 'processing' | 'completed' | 'cancelled' | 'refunded'

export function isNotifiableOrderStatus(status: unknown): status is NotifiableOrderStatus {
  return (
    status === 'processing' ||
    status === 'completed' ||
    status === 'cancelled' ||
    status === 'refunded'
  )
}

export function buildCustomerOrderStatusEmail(
  ctx: OrderEmailContext,
  status: NotifiableOrderStatus,
): {
  subject: string
  html: string
  text: string
} {
  const greeting = greetingLine(ctx)
  const date = formatOrderDate(ctx.createdAt)

  const copy: Record<
    NotifiableOrderStatus,
    { subject: string; intro: string; closing: string }
  > = {
    processing: {
      subject: `Ihre Bestellung ist in Bearbeitung – ${ctx.orderId}`,
      intro:
        'Ihre Bestellung bei NABEA ist in Bearbeitung. Wir bereiten sie derzeit für den Versand vor.',
      closing:
        'Sobald Ihre Bestellung versendet wurde, erhalten Sie eine weitere E-Mail mit den Informationen zu Ihrer Sendung.',
    },
    completed: {
      subject: `Ihre Bestellung wurde versendet – ${ctx.orderId}`,
      intro:
        'gute Nachrichten: Ihre Bestellung bei NABEA wurde versendet und ist auf dem Weg zu Ihnen.',
      closing: 'Wir wünschen Ihnen viel Freude mit Ihrer Bestellung.',
    },
    cancelled: {
      subject: `Ihre Bestellung wurde storniert – ${ctx.orderId}`,
      intro: 'Ihre Bestellung bei NABEA wurde storniert.',
      closing:
        'Falls Sie Fragen haben oder erneut bestellen möchten, antworten Sie gerne auf diese E-Mail.',
    },
    refunded: {
      subject: `Ihre Bestellung wurde erstattet – ${ctx.orderId}`,
      intro:
        'Ihre Bestellung bei NABEA wurde erstattet. Die Rückerstattung erscheint je nach Bank in den nächsten Werktagen auf Ihrem Konto.',
      closing: 'Bei Fragen zu Ihrer Erstattung antworten Sie gerne auf diese E-Mail.',
    },
  }

  const { subject, intro, closing } = copy[status]

  const text = [
    greeting,
    '',
    intro,
    '',
    `Bestellnummer: ${ctx.orderId}`,
    `Bestelldatum: ${date}`,
    '',
    closing,
    '',
    customerSignatureText(),
  ].join('\n')

  const html = wrapEmail(
    subject,
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        ${escapeHtml(intro)}
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
        <strong>Bestellnummer:</strong> ${ctx.orderId}<br />
        <strong>Bestelldatum:</strong> ${escapeHtml(date)}
      </p>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;">
        ${escapeHtml(closing)}
      </p>
      ${customerSignatureHtml()}
    `,
  )

  return { subject, html, text }
}

/**
 * Notify the customer when an order status changes to processing / completed / cancelled / refunded.
 * Does not re-send confirmation or attach the invoice PDF.
 */
export async function sendOrderStatusChangeEmail(
  payload: Payload,
  order: Order,
  status: NotifiableOrderStatus,
  options?: { req?: PayloadRequest },
): Promise<void> {
  const customerEmail = await resolveCustomerEmailForSend(payload, order, {
    req: options?.req,
    backfill: true,
  })

  if (!customerEmail) {
    payload.logger.warn(
      { orderId: order.id, status },
      '[order-emails] No customer email — skipped status-change email',
    )
    return
  }

  const shippingCents =
    typeof order.shippingAmount === 'number' && Number.isFinite(order.shippingAmount)
      ? Math.max(0, Math.round(order.shippingAmount))
      : 0

  const ctx = buildOrderEmailContext(order, customerEmail, { shippingCents })
  const email = buildCustomerOrderStatusEmail(ctx, status)

  try {
    await sendPayloadEmail(payload, {
      to: customerEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })
  } catch (err) {
    payload.logger.error(
      { err, orderId: order.id, status },
      '[order-emails] Failed customer status-change email',
    )
  }
}

type EmailAttachment = {
  filename: string
  content: Buffer
}

/**
 * Send via Payload when possible. With attachments, call Resend REST directly
 * with base64 content (Payload's Resend adapter JSON-encodes Buffers incorrectly).
 */
async function sendPayloadEmail(
  payload: Payload,
  args: {
    to: string
    subject: string
    html: string
    text: string
    attachments?: EmailAttachment[]
  },
): Promise<void> {
  if (!hasOrderEmailConfig()) {
    payload.logger.warn('[order-emails] RESEND_API_KEY missing — skipped email')
    return
  }

  if (args.attachments?.length) {
    const fromAddress = process.env.RESEND_FROM_ADDRESS || 'contact@nabea.at'
    const fromName = process.env.RESEND_FROM_NAME || 'Nabea'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
        attachments: args.attachments.map((a) => ({
          filename: a.filename,
          content: a.content.toString('base64'),
        })),
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Resend attachment email failed (${res.status}): ${body}`)
    }
    return
  }

  await payload.sendEmail({
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  })
}

export function resolveCustomerEmail(order: Order): string | null {
  if (order.customerEmail?.trim()) {
    return order.customerEmail.trim().toLowerCase()
  }
  if (order.customer && typeof order.customer === 'object') {
    const email = (order.customer as User).email?.trim()
    if (email) return email.toLowerCase()
  }
  return null
}

/**
 * Resolve customer email for sending. Looks up the linked User when `customerEmail`
 * is empty and `customer` is only an ID (common for logged-in checkouts).
 * Optionally backfills `orders.customerEmail` so admin shows the address.
 */
export async function resolveCustomerEmailForSend(
  payload: Payload,
  order: Order,
  options?: { req?: PayloadRequest; backfill?: boolean },
): Promise<string | null> {
  const existing = resolveCustomerEmail(order)
  if (existing) return existing

  const customerId =
    order.customer && typeof order.customer === 'object'
      ? order.customer.id
      : order.customer

  if (customerId == null) return null

  try {
    const user = await payload.findByID({
      collection: 'users',
      id: customerId,
      depth: 0,
      overrideAccess: true,
      ...(options?.req ? { req: options.req } : {}),
    })

    const email =
      typeof user?.email === 'string' && user.email.trim()
        ? user.email.trim().toLowerCase()
        : null

    if (email && options?.backfill !== false) {
      try {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: { customerEmail: email },
          overrideAccess: true,
          context: {
            skipOrderStatusEmail: true,
            skipCouponUsageIncrement: true,
          },
          ...(options?.req ? { req: options.req } : {}),
        })
      } catch (err) {
        payload.logger.warn(
          { err, orderId: order.id },
          '[order-emails] Failed to backfill customerEmail on order',
        )
      }
    }

    return email
  } catch (err) {
    payload.logger.warn(
      { err, orderId: order.id, customerId },
      '[order-emails] Failed to resolve customer email from user',
    )
    return null
  }
}

export function resolveOrderLineItems(order: Order): OrderLineItem[] {
  if (!order.items?.length) return []

  return order.items.map((item) => {
    const product =
      item.product && typeof item.product === 'object' ? (item.product as Product) : null
    const variant =
      item.variant && typeof item.variant === 'object' ? (item.variant as Variant) : null

    return {
      title: product?.title?.trim() || 'Produkt',
      variantTitle: variant?.title?.trim() || null,
      quantity: item.quantity ?? 1,
    }
  })
}

function snapshotsToEmailItems(snapshots: InvoiceLineSnapshot[]): OrderLineItem[] {
  return snapshots.map((item) => ({
    title: item.title,
    variantTitle: item.variantTitle,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    lineTotalCents: item.lineTotalCents,
    imageUrl: item.imageUrl,
  }))
}

export function buildOrderEmailContext(
  order: Order,
  customerEmail: string,
  extras?: {
    items?: OrderLineItem[]
    invoiceNumber?: string | null
    shippingCents?: number
    productDiscountCents?: number
    couponCode?: string | null
    couponDiscountCents?: number
  },
): OrderEmailContext {
  const coupon = resolveOrderCouponDiscount(order)
  return {
    orderId: order.id,
    createdAt: order.createdAt,
    customerEmail,
    customerFirstName: order.shippingAddress?.firstName ?? null,
    customerLastName: order.shippingAddress?.lastName ?? null,
    items: extras?.items ?? resolveOrderLineItems(order),
    shippingAddress: order.shippingAddress,
    amountCents: typeof order.amount === 'number' ? order.amount : 0,
    shippingCents: extras?.shippingCents ?? 0,
    invoiceNumber: extras?.invoiceNumber ?? null,
    productDiscountCents:
      extras?.productDiscountCents ?? resolveOrderProductDiscountCents(order),
    couponCode: extras?.couponCode ?? (coupon.couponCode || null),
    couponDiscountCents: extras?.couponDiscountCents ?? coupon.couponDiscountCents,
  }
}

/** Customer Bestellbestätigung (+ PDF) and shop alert after an order is created. */
export async function sendOrderEmails(
  payload: Payload,
  order: Order,
  options?: { req?: PayloadRequest },
): Promise<void> {
  const customerEmail = resolveCustomerEmail(order)
  const shopTo = getOrderNotificationAdminEmail()

  let invoiceNumber: string | null = null
  let pdfAttachment: EmailAttachment | undefined
  let lineItems: OrderLineItem[] = snapshotsToEmailItems(buildInvoiceLineSnapshots(order))
  let shippingCents =
    typeof order.shippingAmount === 'number' && Number.isFinite(order.shippingAmount)
      ? Math.max(0, Math.round(order.shippingAmount))
      : 0

  try {
    // Pass `req` so invoice/media inserts run in the same DB transaction as order create
    // (otherwise FK to orders fails while the order row is still uncommitted).
    const created = await createOrderInvoice(payload, order, { req: options?.req })
    invoiceNumber = created.invoice.number
    pdfAttachment = {
      filename: created.pdfFilename,
      content: created.pdfBuffer,
    }
    if (typeof created.invoice.shippingCents === 'number') {
      shippingCents = Math.max(0, Math.round(created.invoice.shippingCents))
    }
    if (created.invoice.lineItems?.length) {
      lineItems = snapshotsToEmailItems(
        created.invoice.lineItems.map((row) => ({
          title: row.title,
          variantTitle: row.variantTitle,
          quantity: row.quantity,
          unitPriceCents: row.unitPriceCents,
          lineTotalCents: row.lineTotalCents,
          imageUrl: row.imageUrl,
        })),
      )
    }
  } catch (err) {
    payload.logger.error(
      { err, orderId: order.id },
      '[order-emails] Invoice/PDF failed — sending confirmation without attachment',
    )
  }

  const ctx = buildOrderEmailContext(order, customerEmail || 'unbekannt', {
    items: lineItems,
    invoiceNumber,
    shippingCents,
  })

  if (customerEmail) {
    const customer = buildCustomerOrderConfirmationEmail({ ...ctx, customerEmail })
    try {
      await sendPayloadEmail(payload, {
        to: customerEmail,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
        attachments: pdfAttachment ? [pdfAttachment] : undefined,
      })
    } catch (err) {
      payload.logger.error({ err, orderId: order.id }, '[order-emails] Failed customer confirmation')
    }
  } else {
    payload.logger.warn(
      { orderId: order.id },
      '[order-emails] No customer email on order — skipped customer confirmation',
    )
  }

  const shop = buildShopOrderAlertEmail(ctx)
  try {
    await sendPayloadEmail(payload, {
      to: shopTo,
      subject: shop.subject,
      html: shop.html,
      text: shop.text,
      // Same Rechnung PDF the customer gets — shop alert for Amir.
      attachments: pdfAttachment ? [pdfAttachment] : undefined,
    })
  } catch (err) {
    payload.logger.error({ err, orderId: order.id }, '[order-emails] Failed shop alert')
  }
}
