# Technical answers for the privacy policy

> Reviewed from the repository configuration and source code on 28 August 2026. This describes what is implemented in the codebase. Production environment variables and provider dashboards should be checked before publishing the final privacy policy.

## 1. Shop and backend technology

Yes. The shop and backend are built with **Next.js, Payload CMS, and the Payload Ecommerce plugin**. Payload provides the CMS, admin area, customer accounts, ecommerce collections, and API. It is not built with Shopify or WooCommerce.

## 2. Analytics

No visitor analytics tool was found in the codebase. There are no Google Analytics, Google Tag Manager, Plausible, Matomo, PostHog, or similar tracking integrations.

The `/api/analytics` route is an internal dashboard endpoint that calculates shop statistics such as sales, orders, and products. It is not a visitor-tracking or marketing analytics service.

## 3. Marketing and tracking tools

No Meta Pixel, TikTok Pixel, Google Ads tag, Facebook tracking script, or similar marketing/tracking tool was found.

The social-media links in the footer are ordinary external links; social-media tracking pixels are not embedded in the website code.

## 4. Google Fonts

The storefront currently loads **Cormorant Garamond** and **DM Sans** externally from Google Fonts using links to:

- `fonts.googleapis.com`
- `fonts.gstatic.com`

These fonts are not hosted locally in the repository. The Geist fonts are bundled through the `geist` package.

## 5. Customer accounts, orders, and customer data

Payload CMS uses its **PostgreSQL adapter** and connects through the `DATABASE_URI` environment variable. Customer users, addresses, carts, orders, transactions, and related ecommerce data are stored in the Payload database.

The checked environment file points to Supabase-hosted PostgreSQL, while the application code itself is provider-agnostic and accepts any compatible PostgreSQL connection. The exact production provider should be confirmed from the current Vercel `DATABASE_URI` value. Credentials must not be placed in this document.

## 6. Contact and custom-order form submissions

The forms use the **Payload Form Builder plugin**. The storefront submits data to Payload's `/api/form-submissions` endpoint, and submissions are stored in Payload's `form-submissions` collection in the same PostgreSQL database.

No separate external form-storage service was found. No separate custom-order submission handler was identified; any custom-order or inquiry form currently uses the same Payload form system.

If `RESEND_API_KEY` is configured, Payload uses **Resend** for configured form-related emails. Without that key, the submission can still be stored in Payload, but email delivery is not available.

## 7. Newsletter subscriptions and newsletter emails

The newsletter uses **Resend**. Confirmed subscribers are stored as Resend Contacts and are opted into the configured Resend newsletter Topic. Resend also sends the confirmation emails and newsletter campaigns.

The footer form requires explicit consent and uses a confirmation link before the address is added to the newsletter Topic. Resend manages unsubscribe and topic-preference status for newsletter recipients.

## 8. Cookie and consent management

No cookie-consent or consent-management tool was found. There is no Cookiebot, OneTrust, Usercentrics, Klaro, or similar integration.

The storefront does use browser storage for essential functionality:

- Cart ID and cart secret are stored in `localStorage`.
- The user's theme preference is stored in `localStorage`.
- Payload authentication may use essential session cookies; the exact cookie names and expiry should be confirmed in a production browser session.

## 9. Other third-party services

The following services are present or conditionally configured:

- **Stripe**: handles payment processing through the Payload Ecommerce Stripe adapter and Stripe Elements.
- **Resend**: handles Payload email delivery when `RESEND_API_KEY` is configured.
- **Vercel**: the deployment documentation and configuration support Vercel hosting.
- **Vercel Blob Storage**: used for media uploads only when `BLOB_READ_WRITE_TOKEN` is configured; otherwise local media storage is used.
- **Google Fonts**: receives font requests because the storefront loads fonts from Google's servers.
- **Hosted PostgreSQL provider**: stores Payload and ecommerce data through `DATABASE_URI`.

No Sentry, Cloudflare service, CAPTCHA, reCAPTCHA, hCaptcha, Meta, TikTok, Google Ads, or other visitor-tracking service was found in the application source. The `@payloadcms/email-nodemailer` package is installed, but Nodemailer is not configured as the active email adapter.
