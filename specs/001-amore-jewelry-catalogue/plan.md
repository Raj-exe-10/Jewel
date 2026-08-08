# Implementation Plan: Amore Jewelry Catalogue Website & Manager Panel

**Branch**: `001-amore-jewelry-catalogue` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-amore-jewelry-catalogue/spec.md`

## Summary

Build "Amore": a free-tier, single-page, WhatsApp-first jewelry catalogue
storefront with a Mortantra-inspired editorial presentation (video hero,
Founder's Favourites, Shop the Style, filterable catalogue), plus a protected
manager panel at `/admin/*` where the owner and two staff (equal permissions)
perform full CRUD on products/categories/collections/style tags. One Vue 3 +
Vite + TypeScript codebase, deployed as a single installable PWA, backed by
Firebase (Firestore + Storage + Auth) on the free Spark plan. Implementation
is executed test-first (Superpowers TDD skills) against Vitest, the Firebase
Emulator Suite, and Playwright.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS, Vue 3.5 (Composition API)

**Primary Dependencies**: Vite 6, Vue Router 4, Pinia 2, Tailwind CSS 3,
`vite-plugin-pwa`, Firebase JS SDK 10 (Firestore, Storage, Auth),
`browser-image-compression`, `@vueuse/head`

**Storage**: Firebase Firestore (documents: products, categories, collections,
styleTags) + Firebase Storage (product photo files); no relational database

**Testing**: Vitest + `@vue/test-utils` (unit/component), Firebase Emulator
Suite + `@firebase/rules-unit-testing` (security rules + auth integration),
Playwright (end-to-end smoke tests)

**Target Platform**: Mobile-first responsive web (installable PWA), latest
Chrome/Safari/Firefox/Edge, Android and iOS home-screen install

**Project Type**: Web application — single Vue codebase serving both a public
route (`/`) and a protected admin route group (`/admin/*`)

**Performance Goals**: Storefront interactive in <3s on an average mobile
connection (SC-005); catalogue filter/search results render in <1s with 100+
products loaded (SC-002)

**Constraints**: $0 recurring cost (all services on free tiers, no payment
SDKs, no paid APIs, no purchased domain — Constitution Principle I); app
shell must load on a weak/offline connection (FR-026); writes must be
authenticated-only while reads stay public (FR-029, Constitution: Security
rules)

**Scale/Scope**: 20-100 products, 3 manager accounts (owner + 2 staff), a
single public storefront page plus a small admin route group (login,
product list, add/edit form, category/collection/tag management)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Free-Tier Only | Firebase Spark plan, Netlify/Vercel free hosting, no payment/paid-API/paid-domain dependency anywhere in the stack | PASS |
| II. WhatsApp-First Conversion | `wa.me` deep links for every enquire action + floating button; Instagram is an outbound link/embed only, no Graph API | PASS |
| III. Single-Page Public Storefront | Public route is `/` only; mega-menu items implemented as scroll+filter actions against one catalogue component, not new routes | PASS |
| IV. Test-First Development | Vitest/Emulator Suite/Playwright chosen specifically so every task can follow RED-GREEN-REFACTOR (see Development Workflow below) | PASS |
| V. Equal-Access Staff Accounts | Firebase Auth with 3 pre-provisioned accounts, no sign-up UI, identical Firestore/Storage rule grants for all authenticated users | PASS |
| VI. Mobile-First, Installable Everywhere | Tailwind mobile-first breakpoints; single `vite-plugin-pwa` manifest/service-worker covers both `/` and `/admin` | PASS |
| VII. Non-Technical Usability & Friendly Failure | Manager panel UI/error-copy requirements captured in data-model.md and tasks; enforced via component tests asserting friendly copy | PASS |

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-amore-jewelry-catalogue/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
web/                                  # Vue 3 + Vite application (public site + /admin)
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   │   └── index.ts                  # "/" public route, "/admin/*" protected routes
│   ├── firebase/
│   │   ├── config.ts                 # Firebase app init (env-driven)
│   │   ├── auth.ts                   # login/logout/session helpers
│   │   └── firestore.ts              # typed collection accessors
│   ├── stores/                       # Pinia stores
│   │   ├── catalogue.ts              # products/categories/collections/tags + filters
│   │   ├── auth.ts                   # current user/session state
│   │   └── wishlist.ts               # localStorage-backed favorites
│   ├── composables/
│   │   ├── useWhatsAppLink.ts
│   │   └── useImageCompression.ts
│   ├── components/
│   │   ├── public/                   # Header, Hero, FoundersFavourites, ShopTheStyle,
│   │   │                             # CatalogueGrid, ProductCard, FilterChips, SearchBox,
│   │   │                             # AboutSection, ContactSection, Footer, FloatingWhatsApp
│   │   └── admin/                    # LoginForm, ProductList, ProductForm, ConfirmDeleteDialog,
│   │                                 # CategoryManager, PhotoUploader
│   ├── views/
│   │   ├── PublicHome.vue
│   │   ├── admin/AdminLogin.vue
│   │   ├── admin/AdminProductList.vue
│   │   ├── admin/AdminProductForm.vue
│   │   └── admin/AdminCategoryManager.vue
│   └── types/
│       └── catalogue.ts              # Product, Category, Collection, StyleTag types
├── tests/
│   ├── unit/                         # Vitest component/store/composable tests
│   ├── rules/                        # @firebase/rules-unit-testing specs
│   └── e2e/                          # Playwright specs
├── public/
│   ├── manifest.webmanifest          # generated by vite-plugin-pwa
│   └── icons/
├── firestore.rules
├── storage.rules
├── firebase.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

**Structure Decision**: Single web application (`web/`) rather than separate
frontend/backend or separate admin project — matches the confirmed decision
to keep the manager panel as protected routes inside the same Vue codebase,
sharing the same PWA shell, router, and Firebase clients as the public
storefront.

## Complexity Tracking

*No constitution violations — table intentionally empty.*
