# Amore — Designer Jewelry Catalogue

A free-tier, WhatsApp-first jewelry catalogue with an integrated staff manager
panel. Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Pinia + Firebase
(Firestore/Storage/Auth, Spark plan) + PWA. See
[`specs/001-amore-jewelry-catalogue/`](../specs/001-amore-jewelry-catalogue/)
for the full spec, plan, data model, and contracts this app was built from.

## Prerequisites

- Node.js 20+ and npm
- JDK 21+ (required by the Firebase Emulator Suite)
- A free [Firebase](https://firebase.google.com/) project (Spark plan) for
  real deployments — not required for local development, which runs entirely
  against the local emulators

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_*` | Firebase web app config. For local dev these can be placeholder values (e.g. `demo-api-key`) since `VITE_USE_EMULATOR=true` points the app at the local emulators instead of real Firebase. |
| `VITE_USE_EMULATOR` | `true` for local dev, `false`/omitted for production. |
| `VITE_WHATSAPP_NUMBER` | Business WhatsApp number in E.164 without `+` (e.g. `919999999999`), used to build `wa.me` enquiry links. |
| `VITE_INSTAGRAM_HANDLE` | Instagram handle without `@`, used for the profile link and footer. |

## Running locally

Terminal 1 — start the Firebase emulators (Firestore, Auth, Storage):

```bash
npm run emulators
```

Terminal 2 — seed placeholder categories/collections/style tags, 20 mock
products, default homepage sections, and 3 staff accounts (`owner@amore.test` /
`staff1@amore.test` / `staff2@amore.test`, all with password `password123`):

```bash
npm run seed:emulator
```

Terminal 3 — start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173` for the public storefront and
`http://localhost:5173/admin/login` for the manager panel (Homepage, Products,
Taxonomies). The Emulator UI is at `http://127.0.0.1:4000`.

## Testing (TDD: red → green → refactor for every change)

```bash
npm run test          # Vitest unit/component tests
npm run test:watch    # same, in watch mode
npm run test:coverage # with coverage report
npm run test:rules    # Firestore/Storage security rules, against a throwaway emulator instance
npm run test:e2e      # Playwright smoke tests (requires emulators running + seeded, see above)
npm run lint          # ESLint
```

Run everything before considering a change done:

```bash
npm run test && npm run test:rules && npm run test:e2e
```

## Project structure

```
web/
├── src/
│   ├── components/public/   # Storefront sections (nav dropdowns, hero carousels, catalogue, footer, etc.)
│   ├── components/admin/    # Manager panel (homepage sections, product form, photo/video uploaders)
│   ├── views/                # PublicHome.vue, admin/AdminLogin.vue, admin/AdminHomepage.vue, admin/AdminProductList.vue, admin/AdminTaxonomies.vue
│   ├── stores/                # Pinia stores: auth, catalogue, homepage, wishlist
│   ├── composables/           # useWhatsAppLink, useImageCompression
│   ├── router/                 # Route table + auth guard
│   └── firebase/                # Firebase app/emulator initialization
├── tests/
│   ├── unit/                    # Vitest unit/component tests (mirrors src/)
│   ├── rules/                    # Firestore/Storage security rule tests
│   └── e2e/                       # Playwright end-to-end smoke tests
├── scripts/
│   ├── seed-emulator.ts            # Seeds emulator with placeholder data + staff accounts
│   └── generate-icons.mjs          # Regenerates public/icons/ from icon-source/master.png
├── firebase.json, firestore.rules, storage.rules
└── pwa.config.ts                    # Shared PWA manifest (used by vite.config.ts and its own test)
```

## Deploying to production (all free tier)

1. **Create a real Firebase project** at [console.firebase.google.com](https://console.firebase.google.com)
   (Spark/free plan). Enable Firestore, Storage, and Email/Password Auth.
2. Copy `.firebaserc.example` to `.firebaserc` and set your real project ID.
3. Deploy security rules: `npx firebase deploy --only firestore:rules,storage:rules`.
4. Create staff accounts for the owner/manager in the Firebase Auth console
   (Authentication → Users → Add user).
5. Get your web app config from Project Settings → General → Your apps, and
   set the real `VITE_FIREBASE_*` values (plus `VITE_USE_EMULATOR=false`) as
   environment variables in your hosting provider.
6. **Deploy the frontend** to [Netlify](https://netlify.com) or
   [Vercel](https://vercel.com) (both have generous free tiers):
   - Build command: `npm run build`
   - Publish/output directory: `dist`
   - Set the environment variables from step 5 in the hosting dashboard.
7. Add real product photos/categories and homepage sections through `/admin/login`
   once deployed — the seed script is for local development only.
8. Regenerate app icons if you change the brand mark: replace
   `icon-source/master.png` and run `node scripts/generate-icons.mjs`.

## Notes

- This is a single-page catalogue by design (Constitution Principle III) —
  there is no cart, checkout, or payment; every product enquiry happens over
  WhatsApp.
- The wishlist is stored in `localStorage` only; there are no user accounts
  on the public site.
- All three seeded staff accounts have equal permissions — there is no
  role hierarchy (Constitution Principle V).
