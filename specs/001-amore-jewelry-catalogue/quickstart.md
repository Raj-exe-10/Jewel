# Quickstart: Amore Jewelry Catalogue Website & Manager Panel

This is a validation guide, not implementation code. It documents how to
stand up the project locally and prove the feature works end-to-end once the
tasks in `tasks.md` are implemented.

## Prerequisites

- Node.js 20 LTS and npm
- Java 11+ (required by the Firebase Emulator Suite)
- Firebase CLI: `npm install -g firebase-tools`
- A free Firebase project created at https://console.firebase.google.com (Spark/free plan) — only needed for the real deploy, not for local emulator-based development/testing

## Setup

```bash
cd web
npm install
```

Copy `.env.example` to `.env.local` and fill in the Firebase web app config
(`VITE_FIREBASE_*` keys), plus `VITE_WHATSAPP_NUMBER` and
`VITE_INSTAGRAM_HANDLE` placeholders for local dev.

## Running tests (test-first workflow)

```bash
# Unit + component tests (Vitest)
npm run test

# Watch mode, used during RED-GREEN-REFACTOR cycles
npm run test:watch

# Security rules + auth integration tests, against local emulators
firebase emulators:exec --only firestore,auth,storage "npm run test:rules"

# End-to-end smoke tests (Playwright), against the dev server + emulators
npm run test:e2e
```

## Running the app locally

```bash
# Terminal 1: Firebase emulators (Firestore, Auth, Storage)
firebase emulators:start --only firestore,auth,storage

# Terminal 2: seed placeholder content into the emulators
npm run seed:emulator

# Terminal 3: Vite dev server (configured to point at emulators when VITE_USE_EMULATOR=true)
npm run dev
```

## Manual validation scenarios (mirrors spec.md Acceptance Scenarios)

1. **Browse & enquire (User Story 1)**: open `http://localhost:5173`, use a
   category chip and the search box, confirm the grid updates instantly;
   click "Enquire on WhatsApp" on any product and confirm the generated link
   (visible via a test `data-testid="whatsapp-link"` href in dev tools, or
   the actual `wa.me` navigation) includes that product's name.
2. **Curated sections (User Story 2)**: confirm the hero, Founder's
   Favourites, and Shop the Style sections render only products flagged
   accordingly by the seed data, and that tapping a mega-menu item scrolls to
   the catalogue with the right filter chip already active.
3. **Manage the catalogue (User Story 3)**: go to `/admin/login`, sign in
   with a seeded emulator test account, add a product with a placeholder
   photo, and confirm it appears both in the admin product list and — within
   a few seconds — on the public `/` page in another browser tab pointed at
   the same emulator/project data. Use **Homepage** to add, hide, reorder, or
   edit storefront sections (including Shop the Visuals videos).
4. **Install as an app (User Story 4)**: run a production build
   (`npm run build && npm run preview`), open it on a mobile device/emulator,
   and use "Add to Home Screen"; confirm the resulting shortcut opens
   full-screen.

## Definition of done for this quickstart

- [ ] All four manual validation scenarios above pass against a local build.
- [ ] `npm run test`, the rules test command, and `npm run test:e2e` all pass with zero failures.
- [ ] No console errors/warnings during any of the four scenarios.
