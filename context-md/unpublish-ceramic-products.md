# Unpublish ceramic products

How to take ceramic products off the live store without deleting them.

Unpublishing is reversible. The products stay in Payload admin as **Draft**. You can publish them again later.

---

## How the store decides what to show

Products have a status field: `published` or `draft`.

The storefront only shows **published** products. That includes:

- `/shop`
- Product pages (`/products/[slug]`)
- Homepage product carousels that load by category
- Category banners that load by category

Draft products stay visible to admins in the CMS. Customers cannot see them or buy them.

---

## Unpublish one product

1. Open the Payload admin panel.
2. Go to **Products**.
3. Open the ceramic product you want to hide.
4. In the document status control (usually top-right), change **Published** to **Draft**.
5. Save.

That product disappears from shop, search, and category-based homepage blocks after the next page refresh / ISR revalidation (about 10 seconds on the homepage).

---

## Unpublish all ceramic products

1. Open **Products**.
2. Filter the list by the ceramics **category** (each product has a `categories` field in the sidebar).
3. Confirm you are looking at the ceramic products only.
4. Open each product and set status to **Draft**, then save.

If your admin list supports bulk select, you can select the filtered products and use the bulk unpublish / set-to-draft action instead of opening them one by one.

**Do not delete the products** unless you are sure you will never sell them again. Draft is enough to take them off the store.

---

## Variants

Some products use variants (size, colour, etc.).

- Unpublishing the **parent product** is the main step. The product page itself will no longer be public.
- Also check **Variants** on that product (or the Variants collection). If a variant is still **Published**, unpublish it as well so it cannot stay buyable in leftover UI.

On a product edit screen, variants are listed under **Product Variants**. The `_status` column shows whether each variant is published.

---

## After unpublishing: leftover places to check

Unpublishing hides products from shop and from blocks that fetch **by category**. A few places can still mention ceramics until you clean them up.

### 1. Homepage blocks with hand-picked products

Homepage **Product Carousel** and **Category Banner** blocks can be set to:

- **Collection / category** — unpublished products drop out automatically.
- **Selection** (`selectedDocs`) — hand-picked products may still appear until you remove them from the block.

If a ceramic product is still on the homepage after unpublishing, open **Globals → Homepage**, find that block, and remove the selected product.

### 2. Navigation

The header can still show a **Ceramics** category link even if no products are live.

To hide it:

1. Open **Globals → Header**.
2. Edit **Nav Items**.
3. Remove or disable the ceramics category link.
4. Save.

The shop filter bar also lists categories. An empty ceramics filter can still show until you remove or hide that category.

### 3. Related products

Other products may list a ceramic item under **Related Products**. Those links 404 once the ceramic product is unpublished. Clear related-product links if you see them.

### 4. Discounts

If a discount applies to the ceramics category, it will simply match nothing while those products are drafts. You do not have to delete the discount.

---

## What unpublishing does not do

| Action | Result |
| --- | --- |
| Set product to Draft | Hidden from customers. Kept in admin. |
| Delete product | Removed from the CMS. Harder to restore. |
| Delete the ceramics category | Nav/filter may break if other content still points at it. Prefer unpublishing products first. |
| Hide the category in Header | Removes the nav link. Does not unpublish products by itself. |

---

## Republish later

1. Open the product in admin.
2. Set status back to **Published**.
3. Save.
4. If it uses variants, publish the variants you want to sell.
5. If you removed it from homepage selections or nav, add those back if needed.

---

## Quick checklist

- [ ] Filter Products by the ceramics category
- [ ] Set each ceramic product to **Draft**
- [ ] Unpublish variants on those products
- [ ] Remove hand-picked ceramic products from Homepage blocks
- [ ] Remove the ceramics link from Header nav if you do not want the empty category
- [ ] Spot-check `/shop`, homepage, and a former ceramic product URL
