# Inquiry form and page (dashboard guide)

The homepage **Inquiry** block is a copy of About Us. Its button goes to `/anfrage`. This guide covers creating the form, the page, confirmation emails, and adding the block to the homepage.

Code is already in the project. You only need to set this up in admin and add Resend keys.

---

## 1. Resend (required for emails)

Your domain must already be verified in Resend.

1. In Resend, create an API key.
2. Add these environment variables locally (`.env`) **and** on Vercel:

```
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_ADDRESS=contact@nabea.at
RESEND_FROM_NAME=Nabea
```

`RESEND_FROM_ADDRESS` must be an address on the verified domain (for example `contact@nabea.at` or `noreply@nabea.at`).

3. Redeploy after adding the Vercel env vars.

Without `RESEND_API_KEY`, the form still saves submissions in admin, but no email is sent.

---

## 2. Create the form

1. Open admin → **Forms** (under Content).
2. Click **Create New**.
3. **Title:** `Inquiry` (internal name only).
4. **Submit button label:** `Anfrage senden` (or `Send inquiry`).

### Fields

Add exactly three fields. **Name** is the machine id (lowercase). **Label** is what the customer sees. They are different fields in the dashboard.

If Name is `Email` instead of `email`, confirmation mail fails: Resend gets the word `email` instead of the address.

| Type     | Name (exact, lowercase) | Label                                      | Required |
| -------- | ----------------------- | ------------------------------------------ | -------- |
| Text     | `name`                  | Name                                       | Yes      |
| Email    | `email`                 | E-Mail                                     | Yes      |
| Textarea | `inquiry`               | Wobei können wir helfen? / Your inquiry    | Yes      |

Do not add phone or extra fields unless you want them.

### After submit (on the page)

- **Confirmation type:** Message
- **Confirmation message:**  
  `Vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und werden uns so schnell wie möglich bei Ihnen melden.`

### Emails tab — customer confirmation

Add the first email:

- **Email To:** `{{email}}`
- **Email From:** `Nabea <contact@nabea.at>`  
  (same verified domain as `RESEND_FROM_ADDRESS`)
- **Subject:** `Wir haben Ihre Anfrage erhalten`
- **Message:**

```
Thank you for your inquiry. We have received your request and will review it shortly. We will get back to you as soon as possible.

Vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und prüfen sie in Kürze. Wir melden uns so schnell wie möglich.
```

You can include `{{name}}` if you want (e.g. `Hallo {{name}},`).

### Emails tab — notify the shop

Add a second email:

- **Email To:** `contact@nabea.at`
- **Email From:** `Nabea <contact@nabea.at>`
- **Subject:** `Neue Anfrage von {{name}}`
- **Message:** use `{{*:table}}` to dump all fields, or write:

```
Name: {{name}}
Email: {{email}}
Inquiry: {{inquiry}}
```

Save the form.

---

## 3. Create the page

1. Admin → **Pages** → **Create New**.
2. **Title:** `Anfrage`
3. **Slug:** `anfrage`  
   The live URL will be `/anfrage`. The Inquiry block button already defaults to this.
4. **Hero** tab: set type to **None** (no big hero).
5. **Content** tab → add a **Form Block**.
6. Select the **Inquiry** form you just created.
7. Optional: enable intro content, e.g. “Schreiben Sie uns — wir antworten so schnell wie möglich.”
8. Set status to **Published** and save.

Open `/anfrage` and confirm the three fields render.

---

## 4. Add the Inquiry block on the homepage

1. Admin → **Globals** → **Homepage**.
2. Add **Inquiry** (✉️ Inquiry) under About Us.
3. Fill title, image, and text.
4. **Image Position:** use the opposite of About Us (default is text left / image right).
5. **Button Label:** `Unverbindlich anfragen`
6. **Button URL:** `/anfrage`
7. **Publish** the homepage.

On the site, the button should go to `/anfrage`.

---

## 5. Test

1. Open `/anfrage` and submit with your own email.
2. Admin → **Form Submissions** — the row should appear.
3. Check your inbox for the confirmation (and spam).
4. Check `contact@nabea.at` for the shop copy.

If the submission is saved but no email arrives:

- Confirm `RESEND_API_KEY` is set on Vercel and you redeployed.
- Confirm **Email From** uses the verified domain.
- Check the Resend dashboard → Emails / Logs.

---

## Field names (do not rename)

Keep these exact names on the form:

- `name`
- `email`
- `inquiry`

If you rename `email`, `{{email}}` will not send to the customer.
