---
name: Fix gallery sizing
overview: Fix the product gallery so the main image stays a fixed square size regardless of how many photos exist, and turn the thumbnails into a scrollable strip (slider) instead of growing the layout.
todos:
  - id: fix-gallery-layout
    content: "Update Gallery.tsx: items-start + scrollable thumb rail so main square stays fixed size"
    status: completed
isProject: false
---

# Fix product gallery main image shrinking

## Cause

In [`src/components/product/Gallery.tsx`](src/components/product/Gallery.tsx), desktop layout is a flex row: thumbnail column + main square.

```62:99:src/components/product/Gallery.tsx
<div className="flex min-w-0 flex-col-reverse gap-3.5 lg:flex-row">
  ...
  <div className="flex w-full gap-2 overflow-x-auto lg:w-[84px] lg:shrink-0 lg:flex-col lg:overflow-visible">
  ...
  <div className="group relative aspect-square w-full min-w-0 overflow-hidden bg-[#EDE8DD]">
```

Two problems:

1. Thumbnails use `lg:overflow-visible`, so every extra image stacks and makes the left column taller.
2. The flex row defaults to `align-items: stretch`. That stretched height interacts with the main image’s `aspect-square`, so as the thumbnail stack grows, the main image’s computed size shrinks.

Click-to-swap already works via `setCurrent(i)`. No CMS/Neon changes needed.

## Approach

Change only [`src/components/product/Gallery.tsx`](src/components/product/Gallery.tsx):

1. Add `lg:items-start` on the outer flex so the main image never stretches with the thumbnail column.
2. Keep the main image as a fixed `aspect-square w-full` block (same visual size always).
3. Make thumbnails a scrollable rail:
   - Desktop: vertical strip, fixed width (~84px), `overflow-y-auto`, max-height capped to the main image height (e.g. match the square via `lg:max-h-[min(100%,var(...))]` or simpler: wrap both in a container and set thumbnail `lg:max-h-full` / use `lg:h` tied to the main square with a shared parent).
   - Practical layout: outer `lg:items-start`; thumbnail column `lg:max-h-[calc(100vw*...)]` is fragile — better: put main + thumbs in a relative flex where main defines width, and thumbs get `lg:absolute` **or** simply `lg:max-h-[min(560px,100%)]` — cleanest reliable pattern:

```tsx
<div className="flex ... lg:items-start">
  {gallery.length > 1 && (
    <div className="flex ... overflow-x-auto lg:h-[min(100%,theme)] lg:max-h-full lg:w-[84px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden"
         style={{ maxHeight: '100%' }} // height constrained by sibling square via parent
    >
```

   Concrete pattern that works well:

   - Parent: `lg:flex-row lg:items-start`
   - Main: `aspect-square w-full flex-1 min-w-0`
   - Thumbs: `lg:w-[84px] lg:shrink-0 lg:flex-col lg:overflow-y-auto` with `lg:max-h-[100%]` won’t work without equal height parent — so use **JS-free match**: set thumbnail max-height to the same as the main square by making the thumb column `lg:self-stretch` only up to the main’s height via:

   **Chosen approach:** wrap in `grid` on desktop:
   - `lg:grid lg:grid-cols-[84px_1fr] lg:items-start`
   - Main stays `aspect-square`
   - Thumb column: `lg:max-h-full` still weak — use `lg:h-0 lg:min-h-full` trick (column stretches to row height defined by the square, then scrolls):

```tsx
// Thumb column desktop scroll trick:
// Row height is set by the aspect-square main image.
// Thumbs: h-full max-h-full overflow-y-auto with self-stretch
```

   Or simpler and robust: `lg:max-h-[min(100vw,36rem)]` / match typical product column — but the `h-0 min-h-full overflow-y-auto` + grid/flex stretch is the standard fix so thumb height always equals main image height.

4. Keep mobile as horizontal `overflow-x-auto` strip (already mostly correct).
5. Keep existing click handler and variant `GallerySearchSync` behavior unchanged.

## Files

- Edit: [`src/components/product/Gallery.tsx`](src/components/product/Gallery.tsx) only

## Checks

- Product with 1 image: main only, no strip
- Product with 2–3 images: main fixed, thumbs visible, click swaps main
- Product with many images (8+): main size unchanged; thumbs scroll (vertical desktop, horizontal mobile)
- Variant-linked gallery image still auto-selects via search params

## Note

No database/Neon work. This is layout-only.