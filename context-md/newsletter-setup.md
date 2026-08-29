# Newsletter setup

The storefront newsletter uses **Resend** for subscriber storage and newsletter delivery.

## Resend setup

1. In Resend, verify the sending domain for the address used by `RESEND_FROM_ADDRESS`.
2. Create a Topic for the newsletter, for example `Nabea Newsletter`.
3. Copy the Topic ID into `RESEND_NEWSLETTER_TOPIC_ID`.
4. Add these environment variables locally and in Vercel:

```bash
RESEND_API_KEY=
RESEND_FROM_ADDRESS=contact@nabea.at
RESEND_FROM_NAME=Nabea
RESEND_NEWSLETTER_TOPIC_ID=
NEXT_PUBLIC_SERVER_URL=https://your-domain.example
PAYLOAD_SECRET=
```

Never commit real keys or secrets. Redeploy after adding or changing the Vercel variables.

## Subscriber flow

1. A visitor enters an email address and checks the newsletter-consent box.
2. The server sends a confirmation email through Resend.
3. The visitor confirms using the link in that email.
4. The server adds or updates the Resend Contact and opts it into the newsletter Topic.
5. The visitor can manage preferences or unsubscribe using Resend's campaign preference link.

The application does not store confirmed newsletter subscribers in the Payload database. The confirmation token is signed with `PAYLOAD_SECRET` and expires after 24 hours.

## Sending newsletters

Create and send campaigns from Resend using a Broadcast scoped to the newsletter Topic. Include Resend's unsubscribe and preference links in every campaign. The website does not currently compose or automatically send newsletter campaigns.
