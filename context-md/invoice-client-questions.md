# Invoice / Rechnung — questions for client & Steuerberater

Please confirm or correct the following so we can adjust the Rechnung if needed.

## Tax identity

1. **UID (Umsatzsteuer-Identifikationsnummer):** What is the correct UID to print on invoices? (Stored as env `INVOICE_SELLER_UID`; currently omitted when empty.)
2. Is NABEA currently **regelbesteuert at 20% MwSt**, or **Kleinunternehmer** (§ 6 Abs 1 Z 27 UStG) where invoices must not show MwSt the same way?
3. Should the PDF show any additional legal lines (GISA, bank IBAN, Handelsgericht wording beyond FN / LG)?

## Address & seller block

4. Confirm seller address lines for the PDF (today: Sitz Gänserndorf only — no street number on the Rechnung). Do you want a full postal address?
5. Confirm buyer address should remain the **shipping** address (not a separate billing address).

## Amounts & shipping

6. Confirm treating Stripe/`order.amount` as **brutto inkl. 20%** and reverse-calculating Netto / MwSt is correct for your books.
7. Shipping is currently always shown as **Gratis / 0,00 €** because checkout does not store a separate shipping amount on the Order. When you add paid shipping, should it appear as its own MwSt-bearing line?

## Payment & wording

8. Is “Zahlungsart: Online-Zahlung (Stripe)” acceptable on the PDF, or do you prefer “Kreditkarte / Klarna / …” from the payment method?
9. Any required payment-status phrase (e.g. “Betrag dankend erhalten” / “bereits bezahlt”)?

## Numbering & retention

10. Confirm number format **`NABEA-{year}-{####}`** (restarting sequence each calendar year).
11. How long must PDFs be retained, and do you need automatic accountant export beyond the admin ZIP (`/api/invoices/export`)?

## Email

12. Confirm Bestellbestätigung copy in [`email/order-email-text.md`](./email/order-email-text.md) is final (incl. “Ihre Rechnung befindet sich im Anhang…”).

---

## Out of scope for v1 (known gaps)

- Snapshotting unit prices at Stripe **initiate** time (v1 uses prices at order confirm).
- Separate shipping amount on the Order model (needs a checkout change).
- Stripe Invoicing API / Stripe Tax.


# answers:
Tax identity

 1.⁠ ⁠UID
ATU83282528

 2.⁠ ⁠VAT
NABEA e.U. is regelbesteuert at 20% MwSt. and is not using the Kleinunternehmer exemption.

All prices in the NABEA webshop are gross customer prices and already include 20% VAT. VAT must not be added on top of the webshop prices.

 3.⁠ ⁠Additional legal lines
No additional GISA number or bank IBAN is required on the invoice.

Please use the following seller information:

NABEA e.U.
Amir Tabib
Jasmingasse 1a/2
2230 Gänserndorf
Austria
FN 680429g
LG Korneuburg
UID: ATU83282528

Address & seller block

 4.⁠ ⁠Seller address
Please use the full postal address:

NABEA e.U.
Amir Tabib
Jasmingasse 1a/2
2230 Gänserndorf
Austria

 5.⁠ ⁠Buyer address
The shipping address can be used as the buyer address unless the customer provides a separate billing address.

If a separate billing address is provided, please use the billing address on the invoice.

Amounts & shipping

 6.⁠ ⁠Amounts / VAT
Yes. Stripe/order.amount should be treated as the gross amount including 20% VAT.

All webshop prices already include 20% VAT. Do not add VAT on top of the webshop prices.

On the invoice, please display:

Gesamtbetrag: {{Gross Total}}
darin enthaltene MwSt. (20%): {{VAT Amount}}

The VAT amount should be calculated from the gross amount.

 7.⁠ ⁠Shipping
Paid shipping should appear separately on the invoice.

For example:

Versandkosten: 6,90 €

The shipping price is also a gross price including 20% VAT.

If the customer qualifies for free shipping, display:

Versandkosten: Kostenlos

instead of 0,00 €.

Payment & wording

 8.⁠ ⁠Payment method
If Stripe reliably provides the actual payment method, please display it.

For example:

Zahlungsart: Kreditkarte
Zahlungsart: Klarna

If the actual payment method is not reliably available, use:

Zahlungsart: Online-Zahlung (Stripe)

 9.⁠ ⁠Payment status
Please use:

Zahlungsstatus: Bezahlt

Numbering & retention

10.⁠ ⁠Invoice numbering
The invoice number format can be:

NABEA-{year}-{####}

For example:

NABEA-2026-0001
NABEA-2026-0002
NABEA-2026-0003

The sequence can restart for each calendar year.

11.⁠ ⁠Retention & accountant export
Invoice PDFs and the relevant accounting records should be retained for 7 years.

Please keep the existing admin ZIP export (/api/invoices/export).

All generated invoices should remain accessible in the admin area and should be exportable/downloadable collectively for accounting and for our tax advisor.