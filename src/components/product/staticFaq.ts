/**
 * Static FAQ / accordion fallback content shown on the product page when the
 * product has no CMS-authored FAQ data yet.
 *
 * Swap this out with a Payload field once the content team is ready — the
 * accordion UI expects the same shape { title: string; body: string }[].
 */

export type AccordionItem = {
  title: string
  body: string
}

export const STATIC_CARE_AND_SHIPPING: AccordionItem[] = [
  {
    title: 'Dimensions & Care',
    body: 'All dimensions are listed in the product description above. Hand wash only — do not soak or place in a dishwasher. Re-oil periodically with food-safe mineral oil to maintain the natural lustre.',
  },
  {
    title: 'Shipping & Returns',
    body: 'Ships within 1–2 business days from Vienna, Austria. Free standard shipping on orders over € 50. Returns accepted within 30 days for unused items in original packaging. Contact us at hello@nabea.at to initiate a return.',
  },
  {
    title: 'FAQ',
    body: 'Is this food-safe? Yes — all finishes are food-grade. Can I personalise an item? Reach out via our contact page and we will be happy to discuss custom options. Do grain patterns vary? Yes, each piece is unique; the images are representative.',
  },
]
