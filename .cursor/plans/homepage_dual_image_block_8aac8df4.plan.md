---
name: Homepage dual image block
overview: Add a new Homepage layout block with title, a 70/30-style dual image row (admin-controllable left width %), and a description — matching the provided wireframe and existing homepage block patterns.
todos:
  - id: dual-image-config-ui
    content: Create DualImageStory config + Component (title, images, leftWidth%, description)
    status: completed
  - id: dual-image-register
    content: Register block in Homepage global + RenderHomepageBlocks
    status: completed
  - id: dual-image-sql
    content: Write Neon SQL (+ TS companion) for homepage dual image story tables
    status: completed
isProject: false
---

# Homepage dual-image block

## Goal

New block admins can add under **Globals → Homepage → Layout**, matching the wireframe:

1. Title (e.g. `NABEA VOR ORT ENTDECKEN`)
2. Two side-by-side images (default ~70% / ~30%, admin-adjustable)
3. Description paragraph below

Fits the existing homepage blocks system — same registration path as Brand Story, About Us, etc.

## Locked decisions

- **Block slug:** `dualImageStory` (admin label: Dual Image Story)
- **Width control:** one number field `leftWidthPercent` (default `70`, min `20`, max `80`); right column uses `100 - leftWidthPercent`
- **Description:** plain `textarea` (screenshot is a simple paragraph; no rich text / CTA in v1)
- **Images:** two required Media uploads (`leftImage`, `rightImage`); use Media `alt` for accessibility
- **Mobile:** stack full-width (left on top, then right); percentage split only from `md` up
- **Visual language:** match storefront linen/charcoal/serif title + sans body (same family as cart/shop), not the older BrandStory card look
- **DB:** additive Neon SQL for the new block tables (+ draft versions table), per project migration rules

## Implementation

### 1. Block config + frontend

Create [`src/blocks/DualImageStory/config.ts`](src/blocks/DualImageStory/config.ts) and [`src/blocks/DualImageStory/Component.tsx`](src/blocks/DualImageStory/Component.tsx):

Fields:

- `title` (text, required)
- `leftImage` / `rightImage` (upload → `media`, required)
- `leftWidthPercent` (number, default 70, min 20, max 80)
- `description` (textarea, required)

Component layout:

```
[ title ]
[ left image | gap | right image ]   // flex/grid; left style width %
[ description ]
```

Use existing [`Media`](src/components/Media) / Next image patterns from other homepage blocks. Equal row height via shared aspect or `object-cover` in a fixed-height band (desktop).

Optional thin [`AdminPreview.tsx`](src/blocks/DualImageStory/AdminPreview.tsx) only if other blocks in the homepage custom field require it; otherwise skip.

### 2. Register on Homepage

- Import block in [`src/globals/Homepage.ts`](src/globals/Homepage.ts) and add to `layout.blocks`
- Map `dualImageStory` → component in [`src/blocks/RenderHomepageBlocks.tsx`](src/blocks/RenderHomepageBlocks.tsx)

### 3. Neon SQL (+ TS companion)

Add `src/migrations/YYYYMMDD_HHMMSS_dual_image_story.sql` (and `.ts` + register in [`src/migrations/index.ts`](src/migrations/index.ts)) creating:

- `homepage_blocks_dual_image_story`
- `_homepage_v_blocks_dual_image_story` (drafts)

With columns for title, left/right media FKs, `left_width_percent`, description, block metadata (`_order`, `_parent_id`, `_path`, etc.) following the shape of an existing simple block table (e.g. partner logos / media mentions). Use `IF NOT EXISTS` guards. Present SQL for you to run on Neon (no destructive ops).

### 4. Types

You regenerate `pnpm generate:types` after schema registration (same as coupons). No import map unless an AdminPreview custom component is wired.

## Out of scope

- Links / CTAs in the description
- More than two images
- Per-image independent % fields (one left % is enough)
- Changing other homepage blocks

## Acceptance checks

- Block appears in Homepage layout builder and can be added/reordered
- Title + two images + description render on `/`
- Changing `leftWidthPercent` (e.g. 70 → 60) updates the desktop split; mobile stays stacked
- Missing images do not crash the page
- SQL is reviewable and additive for Neon
