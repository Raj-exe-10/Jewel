# Soft-launch checklist (Supabase + Vercel)

## Pre-flight

- [ ] `npm test` green in `web/`
- [ ] `npm run test:rls` green against staging Supabase
- [ ] `npm run test:e2e` green against staging (or local Supabase + Vite)
- [ ] Staff accounts created in Supabase Auth (email confirmed): owner + staff
- [ ] Public signup disabled in Supabase Auth settings
- [ ] SQL migrations applied to staging/production
- [ ] Storage buckets present and public-read policies verified
- [ ] Minimal catalogue seeded (or content entered in admin)

## Vercel

- [ ] Project linked to `web/` (Root Directory = `web`)
- [ ] Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, WhatsApp/Instagram fallbacks
- [ ] SPA rewrite via `vercel.json`
- [ ] Preview deploy smoke: `npm run verify:soft -- https://<preview>.vercel.app`

## Go-live

- [ ] Production Supabase project + migrations
- [ ] Production Vercel env pointing at production Supabase
- [ ] DNS / custom domain on Vercel
- [ ] `verify:soft` on production URL
- [ ] Spot-check: login, create product, public visibility, WhatsApp link, wishlist
- [ ] Monitor Auth/Storage errors 24–48h

## Rollback (greenfield)

- [ ] Redeploy previous Firebase-era branch/build on Vercel **or** previous hosting
- [ ] No production data merge required
