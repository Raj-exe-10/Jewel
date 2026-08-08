# Phase 0 Research: Amore Jewelry Catalogue Website & Manager Panel

No unresolved `NEEDS CLARIFICATION` markers remained from the spec (all major
decisions were resolved with the user beforehand). This document records the
technology-choice research and rationale referenced from Technical Context.

## Decision: Frontend framework & build tool

- **Decision**: Vue 3 (Composition API, `<script setup>`) + Vite 6 + TypeScript.
- **Rationale**: Explicitly requested tech stack; Vite gives fast dev server
  and HMR for iterative TDD cycles; Composition API keeps store/composable
  logic (filters, wishlist, WhatsApp link building) easily unit-testable in
  isolation from components.
- **Alternatives considered**: Nuxt 3 (rejected — its SSR/server features are
  unnecessary for a static-hosted PWA with no server-rendered SEO requirement
  beyond basic meta tags, and add hosting complexity inconsistent with a
  free static-hosting deploy).

## Decision: State management

- **Decision**: Pinia.
- **Rationale**: Official Vue 3 state library, first-class TypeScript
  support, trivially mockable/testable stores for catalogue filtering, auth
  session, and wishlist state.
- **Alternatives considered**: Plain composables/provide-inject (rejected —
  Pinia's devtools support and testing ergonomics are worth the small extra
  dependency for a multi-store app).

## Decision: Styling

- **Decision**: Tailwind CSS.
- **Rationale**: Fast to build a mobile-first, editorial jewelry aesthetic
  (large imagery, generous whitespace) without hand-rolling a full design
  system; utility classes keep component tests focused on behavior, not CSS.
- **Alternatives considered**: Vuetify/other component libraries (rejected —
  their default Material-style look fights against the boutique/editorial
  look of the reference design).

## Decision: Backend platform

- **Decision**: Firebase (Firestore, Storage, Authentication), Spark
  (free) plan.
- **Rationale**: Matches the requirements document exactly; free real-time
  database with a JS SDK that integrates directly into a static-hosted SPA
  with no custom backend server to build/host; free Auth for exactly 3 email
  accounts; free Storage tier comfortably covers 20-100 compressed product
  photos.
- **Alternatives considered**: Supabase (rejected — user confirmed Firebase
  per the original requirements document); custom Node/Express + MongoDB
  (rejected — requires a server to host, which adds cost/ops burden with no
  functional benefit at this scale).

## Decision: Real-time catalogue sync

- **Decision**: Firestore `onSnapshot` listeners on the public storefront for
  products/categories/collections/styleTags collections.
- **Rationale**: Satisfies FR-024/SC-004 (manager-panel changes visible on
  the public site within seconds, no redeploy) natively, without polling or
  a custom pub/sub layer.
- **Alternatives considered**: Manual refresh/polling (rejected — worse UX
  and does not meet the "within a few seconds" success criterion as
  reliably).

## Decision: Authentication approach

- **Decision**: Firebase Authentication, email/password provider only;
  accounts for the 3 users pre-created via Firebase Console or a one-time
  admin script — no in-app sign-up screen.
- **Rationale**: Matches FR-014/FR-015 and Constitution Principle V exactly;
  avoids building/maintaining a sign-up flow that is explicitly out of scope.
- **Alternatives considered**: Custom JWT auth server (rejected — reinvents
  what Firebase Auth already provides for free, adds infrastructure).

## Decision: Route protection for `/admin/*`

- **Decision**: Vue Router `beforeEnter`/global `beforeEach` navigation guard
  checking Firebase Auth's current-user state (via a Pinia `auth` store
  populated by `onAuthStateChanged`), redirecting unauthenticated visitors to
  `/admin/login`.
- **Rationale**: Standard, well-tested Vue Router pattern; keeps the guard
  logic in one composable/store that can be unit-tested without mounting the
  full router.
- **Alternatives considered**: Route-level Firestore rules alone (rejected —
  necessary for data security regardless, but insufficient alone since the
  UI itself must also avoid rendering restricted screens/flashing content).

## Decision: Image handling

- **Decision**: Client-side compression via `browser-image-compression`
  before upload to Firebase Storage; no Cloud Functions/server-side image
  processing.
- **Rationale**: Keeps storage/bandwidth free-tier-friendly (FR-020) without
  requiring a paid Cloud Functions plan (Blaze) for server-side resizing.
- **Alternatives considered**: Firebase Extensions "Resize Images" (rejected
  — requires the Blaze pay-as-you-go plan to deploy Cloud Functions, even if
  usage would stay within free quota, conflicting with Constitution
  Principle I's zero-recurring-cost intent... **and** it needs outbound
  network calls the emulator can't fully replicate for local TDD).

## Decision: PWA tooling

- **Decision**: `vite-plugin-pwa` (Workbox-based) for manifest + service
  worker, `injectManifest`/`generateSW` strategy with a network-first runtime
  caching rule for Firestore/Storage requests and cache-first for the app
  shell.
- **Rationale**: Directly satisfies FR-025/FR-026 (installable on Android and
  iPhone, app shell opens on weak/no connection) with minimal hand-written
  service-worker code, and integrates natively with the Vite build.
- **Alternatives considered**: Hand-written service worker (rejected —
  significantly more code to test and maintain for the same outcome).

## Decision: Testing stack

- **Decision**: Vitest + `@vue/test-utils` for unit/component tests;
  Firebase Emulator Suite (Firestore, Auth, Storage emulators) +
  `@firebase/rules-unit-testing` for security-rule and auth-flow integration
  tests; Playwright for a handful of critical end-to-end smoke tests.
- **Rationale**: All free/open-source and runnable fully offline/locally,
  satisfying Constitution Principle I even for the test infrastructure;
  Vitest shares Vite's config/transform pipeline for fast feedback loops
  required by strict TDD (Constitution Principle IV); the Emulator Suite is
  the only reliable, free way to test Firestore/Storage security rules
  without risking real data or incurring cost.
- **Alternatives considered**: Jest (rejected — Vitest is the natural fit for
  a Vite project, no separate transform config needed); Cypress (rejected in
  favor of Playwright for slightly better multi-browser support and CI
  friendliness, though either would satisfy the requirement).

## Decision: Hosting

- **Decision**: Netlify (or Vercel) free tier, single static deployment for
  the built `web/` app (both `/` and `/admin/*` are client-side routes served
  from the same `index.html`).
- **Rationale**: Free, supports SPA fallback routing, trivial CI-less deploy
  from a git push, satisfies Constitution Principle I.
- **Alternatives considered**: Firebase Hosting (also free and a reasonable
  alternative since it's already in use for the backend — recorded here as
  an acceptable substitute if preferred at deploy time; does not change any
  other part of the design).

## Outstanding clarifications

None. All `NEEDS CLARIFICATION` items are resolved above.
