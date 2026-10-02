# Invoices (Rechnung) system

What was built for Austrian order invoices (Rechnung) and the upgraded Bestellbestätigung email.

## Flow

1. Customer completes Stripe checkout → order is created.
2. Orders `afterChange` (create) runs [`src/utilities/orderEmails.ts`](../src/utilities/orderEmails.ts).
3. [`createOrderInvoice`](../src/utilities/createOrderInvoice.ts) allocates `NABEA-{YYYY}-{####}`, builds a PDF with [`generateInvoicePdf`](../src/utilities/generateInvoicePdf.ts), uploads it to Media, and saves an `invoices` document.
4. Customer email is sent with client copy, HTML line-item table (product images), and the PDF attached.
5. Shop alert email is sent (optionally includes Rechnungsnummer).

If PDF/invoice creation fails, the order still succeeds and the confirmation email is sent **without** an attachment.

## Data model

Collection: **Shop → Invoices** (`src/collections/Invoices.ts`)

| Field | Notes |
|-------|--------|
| `number` | Unique, e.g. `NABEA-2026-0001` |
| `order` | Relationship to order |
| `customerEmail`, `issuedAt` | Snapshot |
| `amountGross` / `amountNet` / `amountTax` | Cents; MwSt reverse-calc from brutto (`darin enthaltene MwSt.`) |
| `lineItems` | Title, variant, qty, unit/line cents, image URL |
| `shippingCents` | From order: €6.90 under €50 subtotal, else `0` (**Kostenlos**) |
| `pdf` | Upload → media |

Access: **admin only**.

## Neon migration

Run on Neon before relying on invoices in production:

[`src/migrations/20260914_000001_invoices.sql`](../src/migrations/20260914_000001_invoices.sql)

Creates `invoices`, `invoices_line_items`, indexes, FKs, and the locked-documents column. *(Already applied on `payload-neon`.)*

## Environment variables

Documented in `.env.example`:

```
INVOICE_SELLER_UID=ATU83282528
INVOICE_VAT_RATE=0.20
```

- `INVOICE_SELLER_UID` — prints `UID: …` on the PDF; omit line if empty.
- `INVOICE_VAT_RATE` — default `0.20`. Order totals are **brutto inkl. MwSt**; contained VAT is derived from `order.amount`.

Also required for email: `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, optional `ORDER_NOTIFICATION_TO`.

## Download / export

- **Single PDF:** Payload Admin → Shop → Invoices → **PDF** column (Download link), or open a row → `pdf` media field.
- **Date-range ZIP:** On the Invoices list, use **Export Rechnungen (ZIP)** (from / to + Download ZIP). Same endpoint: `GET /api/invoices/export?from=YYYY-MM-DD&to=YYYY-MM-DD` (admin session required). Partial packs report how many files were included via response headers.
- **Regenerate missing PDFs:** On the Invoices list, **Regenerate missing PDFs** → `POST /api/invoices/regenerate` with `{ missingOnly: true }` (admin session). Rebuilds from the invoice snapshot (same Rechnungsnummer / issued date / amounts / lines) and enriches buyer address / payment / coupon from the linked order. Uploads a new Media file to R2 and updates `invoices.pdf`. No Vercel Blob recovery — Neon data is enough.

## Seller block on PDF (client-confirmed)

- NABEA e.U.
- Amir Tabib
- Jasmingasse 1a/2
- 2230 Gänserndorf
- Austria
- FN 680429g
- LG Korneuburg
- UID from `INVOICE_SELLER_UID` (e.g. `ATU83282528`)

## Known failure (fixed 2026-09-14)

Invoice create must pass Payload `req` into nested `create` / `findByID` calls so they share the order-create DB transaction. Without that, Postgres rejects `invoices.order_id` (FK) while the order is still uncommitted → email sends without PDF and Invoices admin stays empty.

## PDF totals / payment (client-confirmed)

- Versandkosten: amount or **Kostenlos**
- Gesamtbetrag (brutto)
- darin enthaltene MwSt. (20%)
- Zahlungsart: Stripe method when known (Kreditkarte / Klarna / …), else Online-Zahlung (Stripe)
- Zahlungsstatus: Bezahlt
- Rechnungsempfänger: transaction **billing** address when present, else shipping

## Out of scope / follow-ups

- Answers archive: [`invoice-client-questions.md`](./invoice-client-questions.md)

## Shipping on invoices (2026-09-14)

Shipping is no longer always **Kostenlos**. Flat €6.90 when order product subtotal is under €50; free at €50+. Stored on `orders.shipping_amount` and snapshotted to `invoices.shipping_cents`. See [`implementation-prompts/2026-09-14-paid-shipping.md`](./implementation-prompts/2026-09-14-paid-shipping.md).
