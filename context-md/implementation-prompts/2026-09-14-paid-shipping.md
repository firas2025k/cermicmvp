# Implementation prompt: Paid shipping (€6.90 under €50 / free at €50+)

**Status:** implemented  
**Date:** 2026-09-14  
**Depends on:** Rechnung + order email system (already shipped)

## Shipped (code)

- Charge rule in `src/utilities/shipping.ts` (5000 / 690)
- Stripe initiate wrapper adds shipping to PI amount + metadata
- `orders.shipping_amount` column + `shippingAmount` field; Neon migration applied on `payload-neon`
- Invoice + email use order shipping; cart / CartModal / checkout show Versand + Gesamt
- Header free-shipping bar default/fallback **50** (display-only)

## Goal

Charge and display shipping correctly end-to-end:

- Cart subtotal **under €50** → **€6.90** Versandkosten  
- Cart subtotal **€50 and above** → **Gratis**  
- Rule applies to **one product or many** (based on cart subtotal only)

Wire this through **Stripe charge amount**, **Order storage**, **customer email**, and **Rechnung PDF/invoice record**.

## Confirmed decisions

| Decision | Value |
|---|---|
| Paid shipping amount | €6.90 (`690` cents) |
| Free shipping threshold | €50.00 (`5000` cents), inclusive (≥ €50 → free) |
| Scope of subtotal | Cart product subtotal (discounts already reflected in cart subtotal if present) |
| Multi-item | Same rule; no per-item shipping |
| Invoice/email | Must show real shipping (not hardcoded Gratis) |
| VAT on shipping | TBD with Steuerberater — assume shipping is part of brutto total for now (same 20% treatment as goods unless client says otherwise) |

## Why this is needed

Today:

- Cart UI shows a free-shipping **progress bar** from Header `cartSettings.freeShippingThreshold` (default historically 80 in some places).
- Stripe / order `amount` is effectively **product subtotal only** — shipping is **not** added to the PaymentIntent.
- Invoices store `shippingCents: 0` and emails/PDFs always show **Gratis**.

So customers can see “free shipping from €X” in the cart but are not charged €6.90 when under threshold, and Rechnungen are wrong.

## Inspected code (starting points)

- `src/app/(app)/cart/page.tsx` — free-shipping progress; shows subtotal only  
- `src/globals/Header.ts` — `cartSettings.freeShippingThreshold` / copy  
- `src/components/Header/index.client.tsx` — passes threshold into cart (fallback 80)  
- `src/components/checkout/CheckoutPage.tsx` — `initiatePayment`  
- Ecommerce Stripe adapter (`@payloadcms/plugin-ecommerce`) — PaymentIntent amount from cart  
- `src/utilities/confirmStripeOrder.ts` — order create from PaymentIntent  
- `src/utilities/createOrderInvoice.ts` — `shippingCents = 0`  
- `src/utilities/orderEmails.ts` — Versandkosten from `shippingCents`  
- `src/utilities/generateInvoicePdf.ts` — Versandkosten line  
- `src/collections/Invoices.ts` — `shippingCents` field already exists  

## Proposed design

### 1. Single source of truth for shipping math

Add a small server utility, e.g. `src/utilities/shipping.ts`:

```ts
FREE_SHIPPING_THRESHOLD_CENTS = 5000
FLAT_SHIPPING_CENTS = 690

function calculateShippingCents(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS
}
```

Prefer constants (or env) over relying only on CMS for **charging**, so Stripe amount cannot drift from a CMS typo. CMS threshold/copy can stay for **display**, but should be aligned to €50 / German Gratis text in admin.

### 2. Charge shipping at payment time

Wherever PaymentIntent amount is computed (initiate payment / cart total):

`amount = cart.subtotal + calculateShippingCents(cart.subtotal)`

Must be **server-authoritative**. Do not trust a client-sent shipping fee.

Also put `shippingCents` (and maybe threshold used) in PaymentIntent **metadata** so confirm/order create can persist it without recomputing from a mutated cart.

### 3. Persist on Order

Ecommerce `orders` today have `amount` + `shippingAddress` but **no shipping amount field**.

Options (pick one when implementing):

- **A (preferred):** add `shippingAmount` (number, cents) on Orders via collection override + Neon SQL migration  
- **B:** derive at invoice time from `amount - sum(lineTotals)` (fragile with discounts/rounding)  
- **C:** store only on Invoice (bad — email/admin order view stay wrong)

Recommend **A**.

### 4. Invoice + email

In `createOrderInvoice`:

- Read `order.shippingAmount` (or metadata fallback)  
- Set `shippingCents` on invoice snapshot  
- PDF already has a shipping line — feed real cents  
- `orderEmails`: pass real `shippingCents` instead of `0`  
- Brutto `order.amount` must already include shipping so Netto/MwSt reverse-calc stays consistent

### 5. Storefront UI

- Cart + checkout: show **Zwischensumme**, **Versand (€6,90 or Gratis)**, **Gesamt**  
- Align Header `freeShippingThreshold` default/CMS value to **50**  
- Progress bar: “Kostenloser Versand ab 50,00 €”; under threshold show remaining amount and that shipping will be €6,90  

### 6. Neon

If Order gains `shippingAmount`:

- Write standalone SQL under `src/migrations/` for user/MCP to run on `payload-neon`  
- Do not destroy existing orders; default null/0 for old rows  

## Acceptance criteria

- [ ] Subtotal €49.99 → customer charged +€6.90; email/PDF show Versandkosten 6,90 €  
- [ ] Subtotal €50.00 → shipping €0; email/PDF show Gratis  
- [ ] Multi-item carts use combined subtotal for the threshold  
- [ ] Stripe PaymentIntent amount matches order `amount` (subtotal + shipping)  
- [ ] Invoice `shippingCents` matches what was charged  
- [ ] Cart/checkout UI shows shipping before pay  
- [ ] Failed invoice still does not block order create  
- [ ] SQL migration present and applied on Neon when schema changes  

## Out of scope

- International / weight-based shipping  
- Shipping address country surcharges  
- Stripe Tax / separate shipping tax lines beyond current brutto model  
- Recalculating historical invoices  

## Manual test plan

1. Cart under €50 → checkout shows €6,90 Versand; pay; order amount includes it; email + Rechnung show €6,90  
2. Cart at/above €50 → Gratis; pay; no shipping in amount; email + Rechnung Gratis  
3. Add/remove items around the €50 boundary and confirm PaymentIntent updates  
4. Admin → Invoices: `shippingCents` correct; PDF totals match Stripe charge  

## Open questions (ask client only if needed)

1. Is threshold **exactly ≥ €50.00** after discounts, or before discounts? (Recommend: after discounts = cart subtotal charged.)  
2. Is €6.90 **inkl. 20% MwSt** like product prices? (Assume yes until Steuerberater says otherwise.)  
3. Should CMS remain editable for threshold/flat rate, or hardcode for safety?

## Implementation order (when resuming)

1. `shipping.ts` helper + unit tests if easy  
2. Align CMS/cart UI to €50 + show €6.90  
3. Add shipping into PaymentIntent amount + metadata  
4. Persist `shippingAmount` on Order (+ SQL)  
5. Plumb into `createOrderInvoice` / emails / PDF  
6. End-to-end test on staging/production test card  
