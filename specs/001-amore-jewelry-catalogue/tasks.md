# Tasks: Amore Jewelry Catalogue Website & Manager Panel

**Input**: Design documents from `/specs/001-amore-jewelry-catalogue/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Test tasks are included and MUST be written first and observed failing (RED) before their implementation task, per Constitution Principle IV (Test-First Development, NON-NEGOTIABLE) and the user's explicit request to drive implementation with Superpowers' `test-driven-development` skill.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are relative to the repository root; the app lives in `web/`

## Execution methodology (how these tasks get implemented)

Per the plan, each task below is executed under the Superpowers skills
framework: `subagent-driven-development` dispatches one focused pass per
task, `test-driven-development` enforces RED (watch the test task fail) →
GREEN (minimal code in the paired implementation task) → REFACTOR, and
`requesting-code-review`/`receiving-code-review` plus
`verification-before-completion` gate moving to the next task.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vue 3 + Vite + TypeScript project and its tooling

- [ ] T001 Scaffold Vue 3 + Vite + TypeScript project at `web/` (`npm create vite@latest web -- --template vue-ts`)
- [ ] T002 [P] Install core dependencies in `web/package.json`: `vue-router`, `pinia`, `firebase`, `@vueuse/head`, `browser-image-compression`
- [ ] T003 [P] Configure Tailwind CSS: `web/tailwind.config.ts`, `web/postcss.config.js`, `web/src/style.css`
- [ ] T004 [P] Configure Vitest + `@vue/test-utils`: `web/vitest.config.ts`, `web/tests/unit/setup.ts`
- [ ] T005 [P] Configure ESLint + Prettier for Vue/TS in `web/.eslintrc.cjs` and `web/.prettierrc`
- [ ] T006 [P] Add Firebase project scaffolding at repo root: `firebase.json`, `.firebaserc.example`, empty `firestore.rules`, empty `storage.rules`
- [ ] T007 [P] Configure Playwright: `web/playwright.config.ts`, `web/tests/e2e/` directory
- [ ] T008 Create `web/.env.example` with `VITE_FIREBASE_*`, `VITE_WHATSAPP_NUMBER`, `VITE_INSTAGRAM_HANDLE`, `VITE_USE_EMULATOR` placeholders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure — data types, security rules, Firebase init, auth store, router guard, seed data — that every user story depends on. Authentication and security rules are deliberately placed here, ahead of storefront visual work, per the constitution.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Define shared TypeScript types (`Product`, `Category`, `Collection`, `StyleTag`) in `web/src/types/catalogue.ts` per `data-model.md`
- [ ] T010 [P] Write `firestore.rules` and `storage.rules` at repo root per `specs/001-amore-jewelry-catalogue/contracts/security-rules.md`
- [ ] T011 [P] Write failing security-rule contract tests (all 15 rows of the test matrix) in `web/tests/rules/security-rules.spec.ts` using `@firebase/rules-unit-testing` against the Firebase Emulator Suite, per `contracts/security-rules.md`
- [ ] T012 Configure emulator ports in `firebase.json` and add `test:rules` npm script in `web/package.json` (runs `firebase emulators:exec` wrapping Vitest) so T011 can pass
- [ ] T013 Implement Firebase app initialization in `web/src/firebase/config.ts` (env-driven, connects to emulators when `VITE_USE_EMULATOR=true`)
- [ ] T014 [P] Write failing unit tests for `buildProductEnquiryLink`, `buildGeneralEnquiryLink`, `buildInstagramProfileLink` in `web/tests/unit/whatsapp-link.spec.ts` per `contracts/whatsapp-link-contract.md`
- [ ] T015 Implement `web/src/composables/useWhatsAppLink.ts` (link-builder functions) to make T014 pass
- [ ] T016 [P] Write failing unit tests for the Pinia auth store (successful login, invalid-credential friendly error, logout, reactive `currentUser`) in `web/tests/unit/stores/auth.spec.ts`
- [ ] T017 Implement `web/src/stores/auth.ts` (Firebase Auth email/password sign-in/out, `onAuthStateChanged` sync, friendly error mapping) to make T016 pass
- [ ] T018 [P] Write failing unit test for the router navigation guard (unauthenticated visitor to `/admin/*` redirected to `/admin/login`; authenticated visitor allowed through) in `web/tests/unit/router/guard.spec.ts`
- [ ] T019 Implement `web/src/router/index.ts` with the public `/` route and guarded `/admin/*` routes to make T018 pass
- [ ] T020 Wire `web/src/main.ts` and `web/src/App.vue` with Pinia, Router, and `@vueuse/head`
- [ ] T021 Create `web/scripts/seed-emulator.ts` that seeds placeholder categories, collections, style tags, and ~20 mock products (covering all flags in `data-model.md`) into the Firestore/Storage emulators, plus a `seed:emulator` npm script

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Browse and enquire about a product (Priority: P1) 🎯 MVP

**Goal**: A visitor can browse the seeded catalogue, filter/search it, favorite items, and reach a WhatsApp chat pre-filled with a specific product's name, plus follow Instagram — all without logging in.

**Independent Test**: Load the site against emulator-seeded data with no manager panel involved; browse, filter, search, favorite a product, and confirm the WhatsApp/Instagram links are correct.

### Tests for User Story 1 ⚠️ write first, watch fail

- [ ] T022 [P] [US1] Write failing tests for the catalogue Pinia store's filter/search logic (by category, style tag, collection, and keyword) in `web/tests/unit/stores/catalogue.spec.ts`
- [ ] T023 [P] [US1] Write failing component test for `ProductCard.vue` (renders photo/name/category/price/description, "Enquire on WhatsApp" link contains the product's name, wishlist heart toggles on click) in `web/tests/unit/components/ProductCard.spec.ts`
- [ ] T024 [P] [US1] Write failing component test for `FilterChips.vue` + `SearchBox.vue` (selecting/typing narrows the visible product list) in `web/tests/unit/components/CatalogueFilters.spec.ts`
- [ ] T025 [P] [US1] Write failing component test for `FloatingWhatsAppButton.vue` (always rendered regardless of scroll state, links to the general enquiry message) in `web/tests/unit/components/FloatingWhatsAppButton.spec.ts`
- [ ] T026 [P] [US1] Write failing component test for `CatalogueGrid.vue`'s empty state when no products match the current filter/search (edge case) in `web/tests/unit/components/CatalogueGrid.spec.ts`
- [ ] T027 [P] [US1] Write failing unit tests for the wishlist Pinia store (toggle add/remove, persists to and rehydrates from `localStorage`, no network/account involved) in `web/tests/unit/stores/wishlist.spec.ts` (FR-009)

### Implementation for User Story 1

- [ ] T028 [US1] Implement `web/src/stores/catalogue.ts` (Firestore `onSnapshot` subscriptions for products/categories/collections/styleTags + filter/search getters) to make T022 pass
- [ ] T029 [US1] Implement `web/src/stores/wishlist.ts` (localStorage-backed favorites store) to make T027 pass
- [ ] T030 [P] [US1] Implement `web/src/components/public/ProductCard.vue` (including wishlist heart wired to the wishlist store) to make T023 pass
- [ ] T031 [P] [US1] Implement `web/src/components/public/FilterChips.vue` and `web/src/components/public/SearchBox.vue` to make T024 pass
- [ ] T032 [P] [US1] Implement `web/src/components/public/FloatingWhatsAppButton.vue` to make T025 pass
- [ ] T033 [US1] Implement `web/src/components/public/CatalogueGrid.vue` (grid + empty state, wires filter chips/search box/product card together) to make T026 pass
- [ ] T034 [US1] Implement `web/src/components/public/ContactSection.vue` (general WhatsApp enquiry + Instagram follow buttons)
- [ ] T035 [US1] Implement minimal `web/src/components/public/Header.vue` (logo, placeholder nav) and `web/src/components/public/Footer.vue` (social links, business info)
- [ ] T036 [US1] Assemble `web/src/views/PublicHome.vue` with Header, CatalogueGrid, ContactSection, Footer, FloatingWhatsAppButton
- [ ] T037 [US1] Run `quickstart.md` Scenario 1 manually against seeded emulator data; fix any gaps found

**Checkpoint**: User Story 1 is fully functional and independently testable (MVP).

---

## Phase 4: User Story 3 - Manage the catalogue from a phone (Priority: P1)

**Goal**: The owner/staff can log in, add/edit/delete products with photos, and manage categories/collections/style tags, with changes appearing on the public site (US1) within seconds.

**Independent Test**: Log into the manager panel with a seeded emulator account, add a product with a photo, and confirm it appears in both the manager list and (via US1's already-built storefront) the public catalogue.

### Tests for User Story 3 ⚠️ write first, watch fail

- [ ] T038 [P] [US3] Write failing component test for `AdminLogin.vue` (valid credentials navigate to the product list, invalid credentials show a plain-language error) in `web/tests/unit/components/AdminLogin.spec.ts`
- [ ] T039 [P] [US3] Write failing component test for `ProductForm.vue` validation (name/description required, price >= 0, save blocked with zero photos per data-model.md) in `web/tests/unit/components/ProductForm.spec.ts`
- [ ] T040 [P] [US3] Write failing component test for `ConfirmDeleteDialog.vue` (delete only proceeds after explicit confirmation) in `web/tests/unit/components/ConfirmDeleteDialog.spec.ts`
- [ ] T041 [P] [US3] Write failing unit test for `useImageCompression` (compresses an oversized image, rejects a non-image file) in `web/tests/unit/composables/useImageCompression.spec.ts`
- [ ] T042 [P] [US3] Write failing component test for `CategoryManager.vue` (can add an entry; deleting an entry still referenced by a product is blocked/warned per the edge case in spec.md) in `web/tests/unit/components/CategoryManager.spec.ts`
- [ ] T043 [US3] Write failing Playwright e2e test "staff login → add product → appears on public catalogue" in `web/tests/e2e/manage-catalogue.spec.ts`

### Implementation for User Story 3

- [ ] T044 [US3] Implement `web/src/views/admin/AdminLogin.vue` to make T038 pass
- [ ] T045 [US3] Implement `web/src/composables/useImageCompression.ts` to make T041 pass
- [ ] T046 [US3] Implement `web/src/components/admin/PhotoUploader.vue` (camera/gallery file input + compression + Firebase Storage upload with retry-able error state per edge case)
- [ ] T047 [US3] Implement `web/src/components/admin/ProductForm.vue` (add/edit) to make T039 pass, saving through the `catalogue` store
- [ ] T048 [US3] Implement `web/src/components/admin/ConfirmDeleteDialog.vue` to make T040 pass
- [ ] T049 [US3] Implement `web/src/views/admin/AdminProductList.vue` (searchable list with thumbnail/name/category/price, edit/delete actions)
- [ ] T050 [US3] Implement `web/src/components/admin/CategoryManager.vue` and `web/src/views/admin/AdminCategoryManager.vue` to make T042 pass (categories/collections/style tags CRUD with the deletion guard)
- [ ] T051 [US3] Implement `web/src/components/admin/AdminLayout.vue` (shared nav + logout action wired to the auth store)
- [ ] T052 [US3] Make the T043 Playwright e2e test pass end-to-end against the emulators + dev server

**Checkpoint**: User Stories 1 and 3 both work independently — the catalogue is now fully browsable and manageable end-to-end.

---

## Phase 5: User Story 2 - Discover via curated visual sections (Priority: P2)

**Goal**: The homepage gains the editorial "Shop the Visuals" hero, "Founder's Favourites", "Shop the Style" (Traditional/Modern), and a mega-menu that scrolls to and pre-filters the catalogue built in US1.

**Independent Test**: Load the homepage and confirm each curated section shows the right curated subset of the seeded products, and mega-menu items apply the correct filter to the US1 catalogue grid.

### Tests for User Story 2 ⚠️ write first, watch fail

- [ ] T053 [P] [US2] Write failing component test for `HeroVisuals.vue` (renders a "Shop the Visuals" carousel) in `web/tests/unit/components/HeroVisuals.spec.ts`
- [ ] T054 [P] [US2] Write failing component test for `FoundersFavourites.vue` (renders only products flagged `isFounderFavourite`) in `web/tests/unit/components/FoundersFavourites.spec.ts`
- [ ] T055 [P] [US2] Write failing component test for `ShopTheStyle.vue` (splits products into Traditional/Modern by `styleGroup`) in `web/tests/unit/components/ShopTheStyle.spec.ts`
- [ ] T056 [P] [US2] Write failing component test for `MegaMenu.vue` (selecting a category/collection/style/bridal item applies the matching filter to the catalogue store and scrolls to it) in `web/tests/unit/components/MegaMenu.spec.ts`

### Implementation for User Story 2

- [ ] T057 [P] [US2] Implement `web/src/components/public/HeroVisuals.vue` to make T053 pass
- [ ] T058 [P] [US2] Implement `web/src/components/public/FoundersFavourites.vue` to make T054 pass
- [ ] T059 [P] [US2] Implement `web/src/components/public/ShopTheStyle.vue` to make T055 pass
- [ ] T060 [US2] Implement `web/src/components/public/MegaMenu.vue` to make T056 pass, integrated into `Header.vue`
- [ ] T061 [US2] Extend `web/src/views/PublicHome.vue` to the final section order: Header/MegaMenu, HeroVisuals, FoundersFavourites, ShopTheStyle, CatalogueGrid, About, ContactSection, Footer, FloatingWhatsAppButton

**Checkpoint**: The full editorial homepage experience is complete on top of the working MVP catalogue.

---

## Phase 6: User Story 4 - Install as an app on a phone (Priority: P3)

**Goal**: Both the public storefront and manager panel are installable to a phone's home screen and open full-screen, with the app shell available on a weak/offline connection.

**Independent Test**: Build for production, open on a mobile browser, use "Add to Home Screen", and confirm full-screen launch and offline app-shell load.

### Tests for User Story 4 ⚠️ write first, watch fail

- [ ] T062 [US4] Write a failing build-time check in `web/tests/unit/pwa-manifest.spec.ts` asserting the generated manifest includes `name: "Amore"`, icons, and `display: "standalone"`

### Implementation for User Story 4

- [ ] T063 [US4] Configure `vite-plugin-pwa` in `web/vite.config.ts` (manifest with name/icons/standalone display/theme colors) to make T062 pass
- [ ] T064 [P] [US4] Add app icons (multiple sizes, maskable variant) under `web/public/icons/`
- [ ] T065 [US4] Configure Workbox runtime caching in the `vite-plugin-pwa` config (cache-first for the app shell, network-first for Firestore/Storage requests)
- [ ] T066 [US4] Manually run `quickstart.md` Scenario 4 (Add to Home Screen) on an Android device/emulator and an iOS device/simulator, for both `/` and `/admin`

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates spanning all user stories

- [ ] T067 [P] Add SEO meta tags (title, description, keywords) via `@vueuse/head` in `web/src/views/PublicHome.vue` (FR-028)
- [ ] T068 [P] Audit all manager-panel error copy (login, save, upload, delete) for plain language per Constitution Principle VII
- [ ] T069 [P] Responsive breakpoint QA pass (mobile/tablet/desktop) across the public site and the admin panel per FR-011 and Constitution Principle VI
- [ ] T070 Run the full test suite (`npm run test`, `npm run test:rules`, `npm run test:e2e`) and fix any regressions until all are green
- [ ] T071 Run the complete `quickstart.md` "Definition of done" checklist end-to-end
- [ ] T072 [P] Write `web/README.md` covering setup, environment variables, running emulators/tests, and deployment steps
- [ ] T073 Deploy `web/` to Netlify or Vercel (free tier) plus a real Firebase project, then manually verify SC-005 (load time), SC-007 ($0 cost), and SC-008 (installable on real Android/iPhone devices)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (includes auth + security rules per constitution ordering)
- **User Story 1 (Phase 3)**: Depends only on Foundational — this is the MVP
- **User Story 3 (Phase 4)**: Depends only on Foundational; independently testable, but its e2e test (T043/T052) also exercises the public catalogue built in Phase 3
- **User Story 2 (Phase 5)**: Depends on Foundational + the `catalogue` store and `CatalogueGrid` from Phase 3 (mega-menu filters into it)
- **User Story 4 (Phase 6)**: Depends on Foundational; benefits from Phases 3-5 existing so there is real content to install/preview, but the PWA configuration itself has no functional dependency on them
- **Polish (Phase 7)**: Depends on all preceding phases desired for release

### Parallel Opportunities

- All `[P]` tasks within Phase 1 and Phase 2 can run in parallel (different files)
- Within each user story phase, all test tasks marked `[P]` can be written in parallel; implementation tasks marked `[P]` (different components) can proceed in parallel once their story's tests are red
- Phase 4 (US3) and Phase 5 (US2) can be developed in parallel by different subagents once Phase 3 (US1) has produced `catalogue.ts` and `CatalogueGrid.vue`, since neither depends on the other

---

## Implementation Strategy

### MVP First

1. Phase 1 (Setup) → Phase 2 (Foundational, includes auth + security rules)
2. Phase 3 (User Story 1) → **STOP and VALIDATE** independently against `quickstart.md` Scenario 1
3. This is a deployable MVP: a browsable, WhatsApp-enquiry catalogue with no manager panel yet (content managed via the seed script/Firebase console)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → validate → optional demo (MVP)
3. Add User Story 3 → validate → the system now matches the full requirements document (self-service catalogue)
4. Add User Story 2 → validate → matches the full editorial sketch/reference-design experience
5. Add User Story 4 → validate → matches the "installable everywhere" requirement
6. Phase 7 Polish → deploy
