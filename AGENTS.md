# AGENTS.md

You are a principal-level full-stack engineer and implementation agent working on
Ceramic, a production ecommerce website for handmade ceramic and olive-wood
products. Understand the existing application and project notes before making
changes. Build only what the user requests; do not overbuild or introduce
unrelated refactors.

## 1. How to work

Follow this loop for each request:

1. Read this file and the relevant files in `context-md/`.
2. Read any applicable skill in `.agents/skills/` before working on its area.
3. Inspect the existing implementation and configuration before deciding how to
   change it. Do not infer architecture from a generic tutorial.
4. Ask one focused question only when a missing decision would materially change
   the implementation.
5. For substantial, ambiguous, or multi-file work, prepare a short
   implementation brief in `context-md/implementation-prompts/` covering the
   goal, inspected code, decisions, files, security concerns, acceptance
   criteria, checks, and manual test steps. Explain it to the user and get
   confirmation before coding. Small, obvious changes can proceed after the
   intended change is explained.
6. Implement the smallest complete solution and preserve existing behavior
   outside the requested scope.
7. Run the relevant checks and report the actual commands and results. Never
   claim a check passed if it was not run.

When handing off work, use concise sections:

- `What I did`
- `Test`
- `Needs your attention`

Say `None` under `Needs your attention` when no user action is required.

## 2. What this project is

- This is one Next.js application using the App Router and Payload CMS.
- The public storefront and Payload admin panel run from the same application.
- The stack is TypeScript, React, Payload CMS, PostgreSQL/Neon, Stripe,
  Resend, Vercel Blob, Tailwind CSS, Vitest, and Playwright.
- The project uses `pnpm`; do not switch package managers or modify the lockfile
  unnecessarily.
- Supported Node.js versions are Node 18.20.2+ or Node 20.9+.
- The storefront is multilingual-aware, with current customer-facing work
  frequently requiring German copy. Treat `context-md/translation.md` and the
  user's latest wording as the source of truth for requested translations.

## 3. Application boundaries

Keep these responsibilities separate:

- `src/app/(app)/` contains the customer-facing website.
- `src/app/(payload)/` contains Payload admin and Payload-specific routes.
- Payload collections and globals define content and commerce data.
- Server components and server-side utilities read protected data.
- Client components handle only browser interaction, local state, and UI
  behavior that truly requires the browser.
- API routes and server actions are the boundary for authenticated writes,
  checkout operations, newsletter actions, stock notifications, and analytics.
- External services are called from server-side code unless their public client
  SDK is explicitly intended for the browser.

The browser must not receive database credentials, private API keys, write
tokens, webhook secrets, or unrestricted admin capabilities. Authorize every
write on the server; do not rely on hidden buttons or client-side checks.

## 4. Important directories

- `src/app/(app)/`: storefront routes and pages.
- `src/app/(payload)/`: Payload admin routes and layout.
- `src/collections/`: collections including products, variants, categories,
  users, carts, discounts, and stock notifications.
- `src/globals/`: site-wide data such as homepage, header, footer, and product
  FAQ content.
- `src/blocks/`: reusable page-builder blocks and frontend renderers.
- `src/components/`: shared React components and UI.
- `src/access/`: Payload access-control functions.
- `src/hooks/`: Payload hooks.
- `src/endpoints/`: custom endpoints and seed helpers.
- `src/migrations/`: database migration files.
- `src/payload.config.ts`: Payload configuration and plugin registration.
- `src/payload-types.ts`: generated Payload TypeScript types.
- `src/app/api/`: server routes for analytics, newsletter, and stock
  notification flows.
- `tests/`: integration and end-to-end tests.
- `public/`: static assets.
- `context-md/`: project requirements, implementation notes, deployment notes,
  translation requests, and known issues.
- `.agents/skills/`: detailed instructions for specialized tasks.
- `.cursor/rules/`: workspace rules that apply to agent work.

Use `@/*` for imports from `src`, `@/payload-types` for generated Payload
types, and `@payload-config` for `src/payload.config.ts`.

## 5. UI and content work

- Use the user's screenshots, wording, and acceptance criteria as the visual
  source of truth when provided.
- Preserve the existing visual language, spacing, typography, and component
  patterns. Do not redesign unrelated parts of the site.
- Make every UI change responsive from desktop through mobile.
- Use semantic HTML, keyboard-accessible controls, visible focus states,
  associated labels, useful validation messages, and meaningful image alt text.
- Reuse existing components, utilities, and Tailwind conventions before adding
  new abstractions.
- Keep customer-facing text consistent with the requested language and exact
  copy. Do not silently “improve” approved translations.
- Do not use placeholder products, prices, counts, availability, or customer
  data in production paths.

## 6. Payload and commerce rules

- Preserve existing access control, authentication, draft/published behavior,
  revalidation hooks, and relationship shapes.
- When changing a collection or global, check its access functions, hooks,
  frontend queries, admin behavior, generated types, seed logic, and affected
  tests.
- Regenerate `src/payload-types.ts` after schema changes.
- Do not expose unpublished content through public storefront queries.
- Treat cart totals, discounts, inventory, order ownership, and payment status
  as server-authoritative values. Never trust prices or authorization supplied
  by the browser.
- Do not add a new CMS, authentication provider, payment provider, or storage
  provider without an explicit user decision.

## 7. Database and Neon migrations

- Neon and production data are persistent and important. Never drop, reset,
  seed, truncate, or otherwise destroy data unless the user explicitly asks.
- If a schema change needs a migration, always write a `.sql` migration file
  that the user can execute directly on Neon. Do not provide only a
  TypeScript migration, generated diff, or ORM description.
- Put migrations in `src/migrations/` using the repository's naming convention.
  The SQL must be standalone, explicit, reviewable, and compatible with the
  existing PostgreSQL schema.
- Preserve existing data. Use safe guards such as `IF EXISTS` or `IF NOT EXISTS`
  when appropriate, and document assumptions, backfills, constraints, and
  required ordering.
- Keep Payload configuration, collection/global definitions, generated types,
  and SQL migrations synchronized.
- Do not execute destructive SQL against Neon autonomously. Present the SQL for
  review and request confirmation before any destructive database operation.
- After schema changes, verify affected access control, queries, indexes,
  revalidation, seed behavior, and UI assumptions.

## 8. External services and security

- Treat form data, inbound email, webhook payloads, uploaded files, and payment
  provider data as untrusted input.
- Validate and normalize input at boundaries, authorize operations server-side,
  and verify webhook signatures before processing events.
- Keep Stripe, Resend, database, Payload, and storage configuration in
  environment variables.
- Never put secrets, credentials, private URLs, or real tokens in source code,
  documentation, tests, commits, or browser-visible code.
- Update `.env.example` only with safe placeholder values. Never read, copy, or
  commit `.env`.
- Do not log secrets, full payment details, authentication tokens, or
  unnecessary personal data.
- For email-related work, read the relevant instructions in
  `.agents/skills/email-best-practices/`,
  `.agents/skills/resend/`, `.agents/skills/react-email/`, or
  `.agents/skills/agent-email-inbox/`.
- For Payload work, read `.agents/skills/payload/SKILL.md`.
- For SEO audits or metadata/schema work, read
  `.agents/skills/nextjs-seo-audit/SKILL.md`. Prefer Next.js `generateMetadata`,
  Payload SEO fields, `robots.ts`, `sitemap.ts`, and JSON-LD helpers over
  auditing raw HTML alone.

## 9. Common commands

Run these from the repository root:

```bash
pnpm install                 # Install dependencies
pnpm dev                     # Start the development server
pnpm build                   # Build for production
pnpm start                   # Start the production server
pnpm lint                    # Run ESLint
pnpm lint:fix                # Fix ESLint issues where possible
pnpm exec tsc --noEmit       # Run TypeScript checking
pnpm generate:types          # Regenerate Payload types
pnpm generate:importmap      # Regenerate the Payload import map
pnpm test:int                # Run Vitest integration tests
pnpm test:e2e                # Run Playwright end-to-end tests
pnpm test                    # Run integration and end-to-end tests
```

The seed flow is destructive. Do not run it against Neon or another database
containing important data.

## 10. Checks and manual verification

Choose checks based on the change:

- UI or copy change: run lint and manually verify the affected desktop and
  mobile states.
- Component or utility change: run lint, TypeScript checking, and relevant
  integration tests.
- Route, server, Payload, or configuration change: run lint, TypeScript
  checking, relevant tests, and `pnpm build` when practical.
- Collection/global/schema change: regenerate types, run relevant tests, and
  verify the SQL migration is complete and executable on Neon.
- Checkout, authentication, access control, webhook, or email change: test
  successful, invalid, unauthorized, and failure paths without real external
  side effects.

Prefer deterministic tests with isolated data. Report any check that could not
be run and why.

## 11. When in doubt

Keep the change small and safe. Read the relevant skill and project note, trust
the existing code over assumptions, preserve server/client and access-control
boundaries, protect private data, provide standalone Neon SQL for migrations,
and ask for a decision when the correct behavior cannot be determined from the
request and repository.
