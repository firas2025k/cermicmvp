# Stripe setup for launch — Nabea

Beyond live API keys, you **must** configure a **live webhook endpoint** and put its signing secret in Vercel. This project uses Stripe **PaymentIntents** + Payment Element (not Stripe Checkout hosted pages).

Canonical production URL: `https://nabea.at`  
Webhook path used by this app: **`/api/payments/stripe/webhooks`**

Local forward command (from `package.json`):

```bash
pnpm stripe-webhooks
# → stripe listen --forward-to localhost:3000/api/payments/stripe/webhooks
```

---

## 1. What you need in Production (summary)

| Item | Where | Env var / note |
|---|---|---|
| Publishable key (live) | Vercel Production | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_…` |
| Secret key (live) | Vercel Production | `STRIPE_SECRET_KEY` = `sk_live_…` |
| Webhook signing secret (live) | Vercel Production | `STRIPE_WEBHOOKS_SIGNING_SECRET` = `whsec_…` from the **live** endpoint |
| Live webhook endpoint | Stripe Dashboard → Developers → Webhooks | `https://nabea.at/api/payments/stripe/webhooks` |

Configured in code via [`src/plugins/index.ts`](../src/plugins/index.ts) (`stripeAdapter`).

**Important:** Test mode and Live mode in Stripe are separate. A test webhook secret will **not** work with live keys (and vice versa).

---

## 2. How payments work in this shop (so webhooks make sense)

1. Checkout calls Stripe to create/confirm a **PaymentIntent** (Payment Element).
2. After the customer pays, the browser calls Payload’s **`confirmOrder('stripe', …)`**, which:
   - Retrieves the PaymentIntent from Stripe
   - Creates the **Order** in Payload
   - Updates the cart / transaction
3. Stripe can also **POST events** to your webhook URL. The ecommerce Stripe adapter verifies the signature with `STRIPE_WEBHOOKS_SIGNING_SECRET`.

So: **API keys** let the app create/confirm payments. **Webhooks** let Stripe notify your server asynchronously (and are required for a solid live setup, especially for delayed methods and dashboard health). Do not skip the live webhook when going live.

> Note: This project does not currently pass custom `webhooks: { … }` handlers into `stripeAdapter`. The endpoint still must exist with a valid signing secret. Order creation today is primarily driven by `confirmOrder` after a successful PaymentIntent. Keep the webhook configured anyway for signature verification, Stripe reliability, and future handlers (refunds, failed payments, etc.).

---

## 3. Create the live webhook in Stripe

Do this in the **Live** mode toggle (not Test).

1. Open [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks) (**Live**).
2. Click **Add endpoint**.
3. Endpoint URL:

   ```text
   https://nabea.at/api/payments/stripe/webhooks
   ```

   Until the domain is live, you may temporarily use your Vercel production URL, then update it:

   ```text
   https://YOUR-PROJECT.vercel.app/api/payments/stripe/webhooks
   ```

   Prefer switching to `nabea.at` as soon as the domain points at Production.

4. Select events (recommended for this PaymentIntent shop):

   **Minimum / recommended**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

   **Strongly useful for ops**
   - `charge.refunded`
   - `charge.dispute.created`
   - `charge.dispute.closed`

   **Optional (only if you later enable those methods/products)**
   - `checkout.session.completed` — mainly for Stripe Checkout Sessions (this shop uses Payment Element / PaymentIntents; not the primary path today)
   - `invoice.*` / `customer.subscription.*` — only if you add subscriptions later

5. Save the endpoint.
6. Open the endpoint → **Reveal** / copy **Signing secret** (`whsec_…`).
7. In Vercel → Project → Settings → Environment Variables → **Production**:
   - Set `STRIPE_WEBHOOKS_SIGNING_SECRET` to that live `whsec_…`
8. **Redeploy** Production so the new secret is picked up.

---

## 4. Test-mode webhook (for staging / `*.vercel.app`)

Keep a **separate** endpoint in Stripe **Test** mode:

```text
https://YOUR-PREVIEW-OR-TEST.vercel.app/api/payments/stripe/webhooks
```

- Use test keys (`pk_test_` / `sk_test_`) + that test endpoint’s `whsec_` on Preview/Development env in Vercel.
- Locally: run `pnpm stripe-webhooks` and put the CLI-printed `whsec_` in local `.env` (never commit it).

---

## 5. After launch — verify webhooks work

- [ ] Stripe Live → Webhooks → your endpoint shows **Successful** recent deliveries (2xx)
- [ ] Make a small live payment (or carefully controlled live test), complete checkout on the site
- [ ] Confirm Order appears in Payload admin
- [ ] In Stripe → Payments, the PaymentIntent is `succeeded`
- [ ] If deliveries fail: open the event → response body/status; common causes below

### Common failures

| Symptom | Likely cause |
|---|---|
| 400 / signature errors | Wrong `STRIPE_WEBHOOKS_SIGNING_SECRET`, or test secret used with live endpoint |
| 404 | Wrong URL path (must be `/api/payments/stripe/webhooks`, **not** `/api/stripe/webhooks`) |
| Timeouts | App cold start / deploy down — check Vercel logs |
| Events received but no order | Order is created by `confirmOrder` in the browser flow; if the customer closes the tab too early, investigate failed confirm — webhook handlers are not currently fulfilling orders by themselves |

---

## 6. Checklist (copy into go-live)

- [ ] Stripe account is Live-ready (business details, payouts, Austria/EU)
- [ ] Production env: `pk_live_…`, `sk_live_…`
- [ ] Live webhook endpoint: `https://nabea.at/api/payments/stripe/webhooks`
- [ ] Live events selected (`payment_intent.succeeded`, `payment_intent.payment_failed`, plus refund/dispute as above)
- [ ] Production `STRIPE_WEBHOOKS_SIGNING_SECRET` = live endpoint `whsec_…`
- [ ] Redeployed after env change
- [ ] Successful live checkout smoke test
- [ ] Webhook deliveries show green in Stripe Dashboard

---

## 7. Related

- Env overview: `.env.example`
- Broader launch list: `go-live-checklist.md`
- Deploy notes: `vercel-deployment-guide.md` (older webhook path there is outdated — use **`/api/payments/stripe/webhooks`**)
- Stripe docs: [Work with webhooks](https://docs.stripe.com/webhooks), [Go-live checklist](https://docs.stripe.com/get-started/checklist/go-live)
