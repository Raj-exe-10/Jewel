# Amore — Designer Jewelry Catalogue

A free-tier, WhatsApp-first jewelry catalogue with an integrated staff manager
panel. Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Pinia + **Supabase**
(Auth / Postgres + RLS / Storage / Realtime) + PWA, hosted on **Vercel**.

See [`specs/001-amore-jewelry-catalogue/`](../specs/001-amore-jewelry-catalogue/)
for the spec, data model, and
[`supabase-migration.md`](../specs/001-amore-jewelry-catalogue/supabase-migration.md)
for the port notes.

## Prerequisites

- Node.js 20+ and npm
- [Docker](https://docs.docker.com/get-docker/) + [Supabase CLI](https://supabase.com/docs/guides/cli) for local backend
- A [Supabase](https://supabase.com/) project for staging/production
- A [Vercel](https://vercel.com/) account for hosting

## Setup

```bash
npm install
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase API URL (`http://127.0.0.1:54321` locally) |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for `npm run seed:local` only (never in the browser) |
| `VITE_WHATSAPP_NUMBER` | E.164 without `+` for `wa.me` links |
| `VITE_INSTAGRAM_HANDLE` | Handle without `@` |

## Running locally

```bash
npm run supabase:start          # Docker + migrations + seed.sql
# Copy API URL, anon key, service role from `npx supabase status` into .env.local
npm run seed:local              # Auth staff users + homepage sections
npm run dev
```

Visit `http://localhost:5173` (storefront) and `/admin/login` (manager).
Seeded staff: `owner@amore.test` / `staff1@amore.test` / `staff2@amore.test`
— password `password123`.

## Testing

```bash
npm run test          # Vitest unit/component tests
npm run test:api      # Expanded Auth/RLS/Storage negative suite (needs Supabase + seed)
npm run test:rls      # Legacy RLS smoke + test:api include (needs Supabase + seed)
npm run test:e2e      # Playwright (needs Vite + Supabase + seed)
npm run lint
```

## Soft-launch (Vercel)

1. Create a Supabase project; apply `supabase/migrations`; disable public signup.
2. Create staff users in Auth (or run `seed:local` against the project).
3. Link the repo in Vercel with **Root Directory = `web`**.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (and WhatsApp/Instagram).
5. Deploy; verify with `npm run verify:soft -- https://your-app.vercel.app`.

See [`soft-launch-checklist.md`](../specs/001-amore-jewelry-catalogue/soft-launch-checklist.md).

## Project structure

```
web/
├── src/supabase/          # Client, mappers, storage helpers
├── src/stores/            # Pinia: auth, catalogue, homepage, business, …
├── supabase/              # Migrations, seed.sql, config.toml
├── tests/unit|rls|e2e
├── vercel.json
└── scripts/seed-supabase.ts
```
