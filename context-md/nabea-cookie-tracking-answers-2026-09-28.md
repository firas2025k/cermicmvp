# nabea.at — Cookie & Tracking Answers

**Prepared for:** Amir Toubib  
**Date:** 28 September 2026  
**Scope:** Public storefront `https://www.nabea.at` (Next.js + Payload CMS)

This document answers the open confirmation questions based on the current live website implementation.  
HTTP cookies and browser storage (`localStorage` / `sessionStorage`) are both listed, because both are relevant for privacy disclosures.

> **Note on previously listed facts**  
> The live **shop application** is hosted on **Vercel**. Product images/media are served via **Vercel Blob**. Transactional shop emails (orders, stock alerts, newsletter backend) are sent via **Resend**.  
> Domain/DNS or a Hostinger mailbox may still be used separately; that is outside the application stack described here.

---

## 1. Which cookies / storage are currently set by nabea.at?

| Name | Type | Provider | Purpose | Duration | Category |
|------|------|----------|---------|----------|----------|
| `payload-token` | HTTP cookie | Nabea / Payload CMS | Customer login session (JWT) after account login | **14 days** (`tokenExpiration: 1209600` seconds) | Technically necessary (account) |
| `nabea_cookie_consent` | `localStorage` | Nabea | Stores Accept / Reject choice for the cookie banner | Until cleared by the user | Technically necessary (consent preference) |
| `cart` | `localStorage` | Nabea / Payload Ecommerce | Guest / session shopping cart ID | Until cleared or cart reset | Technically necessary (shop) |
| `cart_secret` | `localStorage` | Nabea / Payload Ecommerce | Secret token to authorize guest cart access | Until cleared or cart reset | Technically necessary (shop) |
| `checkout_guest_email` | `sessionStorage` | Nabea | Temporary guest checkout email during payment flow | Browser tab/session | Technically necessary (checkout) |
| `nabea_pending_checkout` | `sessionStorage` | Nabea | Temporary pending Stripe PaymentIntent data to confirm the order after redirect/return | Browser tab/session | Technically necessary (checkout) |
| `payload-theme` | `localStorage` | Nabea / Payload | UI theme preference (admin/theme helper; storefront default) | Until cleared | Functional / low impact |
| `_ga` | HTTP cookie | Google Analytics 4 | Distinguish users (statistics) | Typically **up to 2 years** | Analytics — **only after Accept** |
| `_ga_*` (e.g. `_ga_XXXXXXXX`) | HTTP cookie | Google Analytics 4 | Persist GA4 session / measurement state | Typically **up to 2 years** | Analytics — **only after Accept** |

**Not used on the storefront (confirmed absent in code):** Meta/Facebook Pixel, TikTok Pixel, Google Ads tags, Google Maps embeds, YouTube embeds, Instagram/TikTok embeds, Cookiebot / OneTrust / similar CMP platforms.

---

## 2. Is Google Analytics or any other analytics/statistics tool currently active?

**Yes — Google Analytics 4 (GA4) is active**, gated by cookie consent.

- Measurement is loaded only when the visitor clicks **Akzeptieren** (Accept).
- If the visitor clicks **Ablehnen** (Reject), or has not chosen yet, the GA4 script is **not** loaded.
- No other analytics tools (Matomo, Hotjar, Vercel Analytics, Meta Pixel, TikTok, Google Ads) are integrated in the storefront code.

---

## 3. Are Google Fonts hosted locally or loaded externally from Google?

**Hosted locally — no requests to `fonts.googleapis.com` / `fonts.gstatic.com`.**

Storefront fonts:

- **Cormorant Garamond** and **DM Sans** — self-hosted `.woff2` files under `/fonts/…`
- **Geist Sans / Geist Mono** — bundled via the `geist` npm package (self-hosted with the site build)

So font files are served from the same website origin; Google Fonts CDN is not used.

---

## 4. Are there any other third-party services, tracking technologies or external resources active?

| Service | When it runs | Role | Tracking? |
|---------|--------------|------|-----------|
| **Google Analytics 4** | Only after cookie Accept | Usage statistics | Yes (consent-gated) |
| **Stripe.js / Payment Element** (`js.stripe.com`) | Checkout page when paying | Card / payment processing | Fraud-prevention cookies (see §5); required for payment |
| **Vercel Blob** | When loading product/media URLs | Image / media CDN storage | No advertising tracking |
| **Resend** | Server-side only (emails) | Transactional / newsletter emails | Not loaded in the visitor’s browser |
| **Neon (PostgreSQL)** | Server-side only | Database | Not loaded in the visitor’s browser |
| **Vercel** | Application hosting | Hosts the Next.js app | No Vercel Analytics package in the storefront |

Contact/inquiry forms and newsletter signup submit to **our own API/CMS**; they do not embed third-party form widgets (e.g. Typeform).

---

## 5. Which cookies / technologies are set by Stripe on the website?

Stripe scripts load **on the checkout page** when the payment UI (`Payment Element`) is shown.

Typical Stripe cookies / storage (set by Stripe, not by Nabea application code):

| Name (typical) | Provider | Purpose | Typical duration |
|----------------|----------|---------|------------------|
| `__stripe_mid` | Stripe | Device / fraud prevention identifier | ~1 year |
| `__stripe_sid` | Stripe | Short-lived Stripe session identifier | ~30 minutes |

Additional Stripe domains may be contacted during payment (e.g. `js.stripe.com`, Stripe API). Exact cookie names can vary slightly with Stripe.js version and payment method; they are used for **payment security / fraud prevention**, not for marketing.

Stripe is **not** loaded site-wide — only when the customer reaches checkout to pay.

---

## 6. Which technically necessary cookies / technologies are used for cart, login, sessions, etc.?

| Technology | Purpose |
|------------|---------|
| `cart` + `cart_secret` (`localStorage`) | Remember the shopping cart for guests and reconnect it across page views |
| `payload-token` (HTTP cookie) | Keep the customer logged in after account login (14 days) |
| `checkout_guest_email` (`sessionStorage`) | Keep guest email during checkout |
| `nabea_pending_checkout` (`sessionStorage`) | Complete order confirmation after Stripe payment |
| `nabea_cookie_consent` (`localStorage`) | Remember consent choice so the banner is not shown every visit |

The shopping cart itself is stored as a **server-side cart document** in the CMS/database; the browser only stores the cart ID + secret needed to access it.

---

## 7. Which cookie consent / banner system is currently being used?

**Custom first-party banner** built into the Nabea storefront (not Cookiebot, Usercentrics, OneTrust, CookieYes, etc.).

- German UI: “Cookies & Analyse” with **Ablehnen** / **Akzeptieren**
- Links to `/cookies` (Cookie-Richtlinie) and `/datenschutz` (Datenschutzerklärung)
- Choice stored in `localStorage` key `nabea_cookie_consent` (`accepted` | `rejected`)

---

## 8. Are all non-essential cookies blocked until the visitor gives consent?

**For Google Analytics: yes.**

- GA4 scripts and GA cookies (`_ga`, `_ga_*`) are loaded **only after Accept**.
- On Reject (or before any choice), GA is not loaded.

**Clarifications for legal review:**

1. **Technically necessary** shop/login/checkout storage (`cart`, `cart_secret`, `payload-token`, checkout `sessionStorage`, consent preference) can be set **without** analytics consent, because they are required to run the shop and remember the consent choice.
2. **Stripe** loads on the **checkout** page for payment processing. Stripe’s fraud-prevention cookies are generally treated as necessary for the payment contract; they are **not** currently gated behind the analytics banner. They are not used for marketing.
3. There is **no** Meta / TikTok / Google Ads / other marketing tracking to block.

---

## Summary for counsel

| Topic | Status on nabea.at |
|-------|--------------------|
| Marketing pixels (Meta, TikTok, Ads) | Not active |
| Google Analytics 4 | Active, **consent-gated** |
| Google Fonts CDN | Not used (fonts self-hosted) |
| Cookie CMP | Custom banner (Accept / Reject) |
| Cart / login | Necessary storage + `payload-token` cookie |
| Stripe | Checkout only; payment / fraud cookies |
| Other browser trackers | None identified in storefront code |

---

*Technical source: current Nabea storefront codebase and configuration as of 28 September 2026. Cookie durations for Google and Stripe follow typical provider defaults and should be verified in a live browser DevTools → Application → Cookies check if the lawyer needs exact live values.*
