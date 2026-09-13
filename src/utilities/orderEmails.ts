import type { Order, Product, User, Variant } from '@/payload-types'
import type { Payload } from 'payload'

import { absoluteUrl } from '@/utilities/absoluteUrl'
import { formatEUR } from '@/utilities/formatEUR'

export type OrderLineItem = {
  title: string
  variantTitle?: string | null
  quantity: number
}

export type OrderEmailContext = {
  orderId: number
  createdAt: string
  customerEmail: string
  customerFirstName?: string | null
  items: OrderLineItem[]
  shippingAddress?: Order['shippingAddress']
  amountCents: number
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
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
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
    'Sitz: Gänserndorf',
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
    Sitz: Gänserndorf<br />
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

const orderViewUrl = (ctx: OrderEmailContext): string | undefined => {
  const path = `/orders/${ctx.orderId}?email=${encodeURIComponent(ctx.customerEmail)}`
  return absoluteUrl(path)
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
  items.map((item) => `• ${item.quantity}× ${lineLabel(item)}`).join('\n') || '• —'

const itemsHtml = (items: OrderLineItem[]): string => {
  if (!items.length) {
    return '<li style="margin:0 0 6px;">—</li>'
  }
  return items
    .map(
      (item) =>
        `<li style="margin:0 0 6px;">${escapeHtml(String(item.quantity))}× ${escapeHtml(lineLabel(item))}</li>`,
    )
    .join('')
}

export function buildCustomerOrderConfirmationEmail(ctx: OrderEmailContext): {
  subject: string
  html: string
  text: string
} {
  const subject = `NABEA – Bestellbestätigung #${ctx.orderId}`
  const greeting = greetingLine(ctx)
  const total = formatEUR(ctx.amountCents)
  const date = formatOrderDate(ctx.createdAt)
  const viewUrl = orderViewUrl(ctx)
  const address = ctx.shippingAddress

  const text = [
    greeting,
    '',
    'vielen Dank für Ihre Bestellung bei NABEA.',
    '',
    `Bestellnummer: #${ctx.orderId}`,
    `Bestelldatum: ${date}`,
    '',
    'Artikel:',
    itemsText(ctx.items),
    '',
    address ? 'Lieferadresse:' : null,
    address ? formatAddressText(address) : null,
    address ? '' : null,
    `Gesamtbetrag: ${total} (inkl. MwSt.)`,
    '',
    viewUrl ? 'Ihre Bestellung ansehen:' : null,
    viewUrl || null,
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
        vielen Dank für Ihre Bestellung bei NABEA.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
        <strong>Bestellnummer:</strong> #${ctx.orderId}<br />
        <strong>Bestelldatum:</strong> ${escapeHtml(date)}
      </p>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Artikel</strong></p>
      <ul style="margin:0 0 16px;padding-left:18px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
        ${itemsHtml(ctx.items)}
      </ul>
      ${
        address
          ? `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Lieferadresse</strong></p>
             <p style="margin:0 0 16px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
               ${formatAddressHtml(address)}
             </p>`
          : ''
      }
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
        <strong>Gesamtbetrag:</strong> ${escapeHtml(total)} <span style="font-size:13px;color:#8C8680;">(inkl. MwSt.)</span>
      </p>
      ${
        viewUrl
          ? `<p style="margin:0 0 24px;">
              <a href="${escapeHtml(viewUrl)}" style="display:inline-block;padding:12px 20px;background:#2C2A27;color:#F8F4EE;text-decoration:none;font-family:system-ui,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">
                Bestellung ansehen
              </a>
            </p>`
          : ''
      }
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
        <li><strong>Gesamtbetrag:</strong> ${escapeHtml(total)}</li>
      </ul>
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;"><strong>Artikel</strong></p>
      <ul style="margin:0 0 16px;padding-left:18px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
        ${itemsHtml(ctx.items)}
      </ul>
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

async function sendPayloadEmail(
  payload: Payload,
  args: { to: string; subject: string; html: string; text: string },
): Promise<void> {
  if (!hasOrderEmailConfig()) {
    payload.logger.warn('[order-emails] RESEND_API_KEY missing — skipped email')
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

export function buildOrderEmailContext(order: Order, customerEmail: string): OrderEmailContext {
  return {
    orderId: order.id,
    createdAt: order.createdAt,
    customerEmail,
    customerFirstName: order.shippingAddress?.firstName ?? null,
    items: resolveOrderLineItems(order),
    shippingAddress: order.shippingAddress,
    amountCents: typeof order.amount === 'number' ? order.amount : 0,
  }
}

/** Customer Bestellbestätigung + shop alert after an order is created. */
export async function sendOrderEmails(payload: Payload, order: Order): Promise<void> {
  const customerEmail = resolveCustomerEmail(order)
  const shopTo = getOrderNotificationAdminEmail()

  // Prefer a real customer address for shop context; fall back to placeholder for admin-only.
  const ctx = buildOrderEmailContext(order, customerEmail || 'unbekannt')

  if (customerEmail) {
    const customer = buildCustomerOrderConfirmationEmail({ ...ctx, customerEmail })
    try {
      await sendPayloadEmail(payload, {
        to: customerEmail,
        subject: customer.subject,
        html: customer.html,
        text: customer.text,
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
    })
  } catch (err) {
    payload.logger.error({ err, orderId: order.id }, '[order-emails] Failed shop alert')
  }
}
