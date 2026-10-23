# Supabase + Vercel migration note

**Status:** In progress (greenfield soft-launch)

## Target stack

| Concern | Was | Now |
|---------|-----|-----|
| Auth | Firebase Auth (email/password) | Supabase Auth (email/password; public signup disabled) |
| Database | Cloud Firestore | Postgres + RLS + Realtime |
| Files | Firebase Storage | Supabase Storage |
| Hosting | Firebase Hosting | Vercel (static Vite SPA) |

## Scope freeze

Existing catalogue FRs only: public browse/filter/enquire, staff equal-permission CMS.
No cart, payments, customer accounts, or public registration.

## Firebase baseline (pre-port)

Recorded from `web/` on 2026-10-23:

- Unit: **237 passed / 5 failed / 242 total** (4 files with pre-existing failures under ShopByCategories / related nav)
- Rules + E2E: require Firebase emulators; not re-run as go-forward suite (replaced by Supabase RLS + Playwright against Supabase)

## Local / CI

- Schema: `web/supabase/migrations/`
- Seed: `web/supabase/seed.sql` + `web/scripts/seed-supabase.ts` (Auth users)
- Requires Supabase CLI + Docker for `supabase start`, or a hosted project with the same migrations applied
