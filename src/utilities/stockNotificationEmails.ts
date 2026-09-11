import type { Payload } from 'payload'

import { absoluteUrl } from '@/utilities/absoluteUrl'

export type StockNotifyEmailContext = {
  customerName?: string | null
  customerEmail: string
  productTitle: string
  productSlug?: string | null
  variantTitle?: string | null
  variantId?: number | null
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const getStockNotificationAdminEmail = (): string =>
  process.env.STOCK_NOTIFICATION_TO ||
  process.env.RESEND_FROM_ADDRESS ||
  'contact@nabea.at'

export const hasStockNotificationEmailConfig = (): boolean =>
  Boolean(process.env.RESEND_API_KEY)

const productLabel = (ctx: StockNotifyEmailContext): string => {
  const title = ctx.productTitle.trim() || 'Produkt'
  const variant = ctx.variantTitle?.trim()
  return variant ? `${title} – ${variant}` : title
}

const productUrl = (ctx: StockNotifyEmailContext): string | undefined => {
  if (!ctx.productSlug) return undefined
  const path =
    ctx.variantId != null
      ? `/products/${ctx.productSlug}?variant=${ctx.variantId}`
      : `/products/${ctx.productSlug}`
  return absoluteUrl(path)
}

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

const firstName = (ctx: StockNotifyEmailContext): string | null => {
  const raw = ctx.customerName?.trim()
  if (!raw) return null
  return raw.split(/\s+/)[0] || null
}

const greetingLine = (ctx: StockNotifyEmailContext): string => {
  const vorname = firstName(ctx)
  return vorname ? `Hallo ${vorname},` : 'Hallo,'
}

const customerSignatureText = (withSitzPrefix: boolean): string =>
  [
    'Freundliche Grüße',
    '',
    'NABEA e.U.',
    'Amir Tabib',
    'contact@nabea.at',
    '',
    withSitzPrefix ? 'Sitz: Gänserndorf' : 'Gänserndorf',
    'FN 680429g',
    'LG Korneuburg',
  ].join('\n')

const customerSignatureHtml = (withSitzPrefix: boolean): string => `
  <p style="margin:24px 0 0;font-size:16px;line-height:1.6;">Freundliche Grüße</p>
  <p style="margin:16px 0 0;font-size:15px;line-height:1.7;">
    NABEA e.U.<br />
    Amir Tabib<br />
    <a href="mailto:contact@nabea.at" style="color:#4A5E3A;">contact@nabea.at</a>
  </p>
  <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#8C8680;">
    ${withSitzPrefix ? 'Sitz: Gänserndorf' : 'Gänserndorf'}<br />
    FN 680429g<br />
    LG Korneuburg
  </p>
`

export function buildCustomerRequestConfirmationEmail(ctx: StockNotifyEmailContext): {
  subject: string
  html: string
  text: string
} {
  const label = productLabel(ctx)
  const greeting = greetingLine(ctx)
  const subject = 'NABEA – Benachrichtigung aktiviert'
  const text = [
    greeting,
    '',
    `vielen Dank für Ihr Interesse an ${label}.`,
    '',
    'Wir haben Ihre E-Mail-Adresse vorgemerkt und benachrichtigen Sie, sobald das Produkt wieder verfügbar ist.',
    '',
    customerSignatureText(false),
  ].join('\n')

  const html = wrapEmail(
    subject,
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        vielen Dank für Ihr Interesse an <strong>${escapeHtml(label)}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Wir haben Ihre E-Mail-Adresse vorgemerkt und benachrichtigen Sie, sobald das Produkt wieder verfügbar ist.
      </p>
      ${customerSignatureHtml(false)}
    `,
  )

  return { subject, html, text }
}

export function buildAdminStockRequestEmail(ctx: StockNotifyEmailContext): {
  subject: string
  html: string
  text: string
} {
  const label = productLabel(ctx)
  const subject = `Neue Lager-Benachrichtigung: ${label}`
  const lines = [
    'Neue Anfrage zur Lager-Benachrichtigung:',
    '',
    `Name: ${ctx.customerName?.trim() || '—'}`,
    `E-Mail: ${ctx.customerEmail}`,
    `Produkt: ${ctx.productTitle}`,
    ctx.variantTitle ? `Variante: ${ctx.variantTitle}` : null,
    ctx.variantId != null ? `Varianten-ID: ${ctx.variantId}` : null,
  ].filter(Boolean) as string[]

  const text = lines.join('\n')
  const html = wrapEmail(
    subject,
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Neue Anfrage zur Lager-Benachrichtigung:
      </p>
      <ul style="margin:0;padding-left:18px;font-size:15px;line-height:1.7;font-family:system-ui,sans-serif;">
        <li><strong>Name:</strong> ${escapeHtml(ctx.customerName?.trim() || '—')}</li>
        <li><strong>E-Mail:</strong> ${escapeHtml(ctx.customerEmail)}</li>
        <li><strong>Produkt:</strong> ${escapeHtml(ctx.productTitle)}</li>
        ${
          ctx.variantTitle
            ? `<li><strong>Variante:</strong> ${escapeHtml(ctx.variantTitle)}</li>`
            : ''
        }
        ${
          ctx.variantId != null
            ? `<li><strong>Varianten-ID:</strong> ${ctx.variantId}</li>`
            : ''
        }
      </ul>
    `,
  )

  return { subject, html, text }
}

export function buildBackInStockEmail(ctx: StockNotifyEmailContext): {
  subject: string
  html: string
  text: string
} {
  const label = productLabel(ctx)
  const url = productUrl(ctx)
  const greeting = greetingLine(ctx)
  const subject = 'NABEA – Ihr Wunschprodukt ist wieder vorrätig'
  const text = [
    greeting,
    '',
    `gute Nachrichten: ${label} ist wieder vorrätig.`,
    '',
    'Sie können das Produkt ab sofort wieder in unserem Onlineshop bestellen.',
    '',
    url || null,
    '',
    customerSignatureText(true),
  ]
    .filter((line) => line !== null)
    .join('\n')

  const html = wrapEmail(
    subject,
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        gute Nachrichten: <strong>${escapeHtml(label)}</strong> ist wieder vorrätig.
      </p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
        Sie können das Produkt ab sofort wieder in unserem Onlineshop bestellen.
      </p>
      ${
        url
          ? `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;">
              <a href="${escapeHtml(url)}" style="color:#4A5E3A;">${escapeHtml(url)}</a>
            </p>
            <p style="margin:0 0 24px;">
              <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#2C2A27;color:#F8F4EE;text-decoration:none;font-family:system-ui,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">
                Zum Produkt
              </a>
            </p>`
          : ''
      }
      ${customerSignatureHtml(true)}
    `,
  )

  return { subject, html, text }
}

async function sendPayloadEmail(
  payload: Payload,
  args: { to: string; subject: string; html: string; text: string },
): Promise<void> {
  if (!hasStockNotificationEmailConfig()) {
    payload.logger.warn('[stock-notifications] RESEND_API_KEY missing — skipped email')
    return
  }

  await payload.sendEmail({
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  })
}

/** Customer confirmation + shop alert after a guest submits the notify form. */
export async function sendStockRequestEmails(
  payload: Payload,
  ctx: StockNotifyEmailContext,
): Promise<void> {
  const customer = buildCustomerRequestConfirmationEmail(ctx)
  const admin = buildAdminStockRequestEmail(ctx)
  const adminTo = getStockNotificationAdminEmail()

  try {
    await sendPayloadEmail(payload, {
      to: ctx.customerEmail,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
    })
  } catch (err) {
    payload.logger.error({ err }, '[stock-notifications] Failed to send customer confirmation')
  }

  try {
    await sendPayloadEmail(payload, {
      to: adminTo,
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
    })
  } catch (err) {
    payload.logger.error({ err }, '[stock-notifications] Failed to send admin alert')
  }
}

/** Email waitlisted guests and mark their rows as notified. */
export async function notifyWaitlistBackInStock(
  payload: Payload,
  args: {
    productId: number
    productTitle: string
    productSlug?: string | null
    variantId?: number | null
    variantTitle?: string | null
  },
): Promise<void> {
  const andConditions: Record<string, unknown>[] = [
    { product: { equals: args.productId } },
    { notified: { equals: false } },
  ]

  if (args.variantId != null) {
    andConditions.push({ variantId: { equals: args.variantId } })
  } else {
    andConditions.push({
      or: [{ variantId: { exists: false } }, { variantId: { equals: null } }],
    })
  }

  const pending = await payload.find({
    collection: 'stock-notifications',
    where: { and: andConditions },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  if (!pending.docs.length) return

  for (const doc of pending.docs) {
    if (!doc.email) continue

    const email = buildBackInStockEmail({
      customerName: doc.name,
      customerEmail: doc.email,
      productTitle: args.productTitle || doc.productTitle || 'Produkt',
      productSlug: args.productSlug,
      variantTitle: args.variantTitle ?? doc.variantTitle,
      variantId: args.variantId ?? doc.variantId,
    })

    try {
      await sendPayloadEmail(payload, {
        to: doc.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      })

      await payload.update({
        collection: 'stock-notifications',
        id: doc.id,
        data: { notified: true },
        overrideAccess: true,
        context: { skipStockNotify: true },
      })
    } catch (err) {
      payload.logger.error(
        { err, notificationId: doc.id },
        '[stock-notifications] Failed back-in-stock email',
      )
    }
  }
}

export function inventoryBecameAvailable(
  previousInventory: number | null | undefined,
  nextInventory: number | null | undefined,
): boolean {
  const prev = previousInventory ?? 0
  const next = nextInventory ?? 0
  return prev <= 0 && next > 0
}
