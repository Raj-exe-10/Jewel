# Graph Report - web  (2026-08-09)

## Corpus Check
- 102 files · ~118,842 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 517 nodes · 683 edges · 56 communities (26 shown, 30 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Public Storefront Sections
- HTML Entry & Shell
- Catalogue State & Types
- Contact & Social Links
- Core Dependencies
- Site Header & Nav
- App Shell & Auth
- Photo Uploader
- Admin Category Manager
- Tooling Config Refs
- TSConfig Compiler Options
- Emulator Seed Scripts
- Test Unit Setup
- Brand Icons & PWA Assets
- Lint & Test Toolchain
- Social Icon Sprite
- PWA Manifest Config
- E2E Catalogue/Admin Spec
- Admin Login Spec
- Image Compression Spec
- TSConfig Project Refs
- Cross-Env Dep
- ESLint Prettier Dep
- ESLint Core Dep
- ESLint Vue Plugin Dep
- Firebase Admin Dep
- Firebase Rules Test Dep
- Firebase Tools Dep
- Globals Dep
- Jsdom Dep
- Sharp Dep
- TailwindCSS Dep
- Tailwind Vite Dep
- TSX Dep
- Node Types Dep
- TypeScript Dep
- TS-ESLint Plugin Dep
- TS-ESLint Parser Dep
- Vite Dep
- Vite PWA Plugin Dep
- Vite Vue Plugin Dep
- Vitest Dep
- Vitest Coverage Dep
- Vue Test Utils Dep
- Vue TSConfig Dep

## God Nodes (most connected - your core abstractions)
1. `Amore — Designer Jewelry Catalogue` - 37 edges
2. `useCatalogueStore` - 17 edges
3. `Product` - 15 edges
4. `compilerOptions` - 15 edges
5. `scripts` - 13 edges
6. `Category` - 11 edges
7. `useCatalogueNav()` - 10 edges
8. `buildGeneralEnquiryLink()` - 8 edges
9. `compilerOptions` - 8 edges
10. `index.html — App Entry Point` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Theme Color #262220` --conceptually_related_to--> `Amore — Designer Jewelry Catalogue`  [INFERRED]
  index.html → README.md
- `Apple Touch Icon` --references--> `Master Icon Source`  [INFERRED]
  public/icons/apple-touch-icon.png → icon-source/master.png
- `PWA Icon 192px` --references--> `Master Icon Source`  [INFERRED]
  public/icons/icon-192.png → icon-source/master.png
- `Maskable App Icon 512px` --references--> `Master Icon Source`  [INFERRED]
  public/icons/icon-maskable-512.png → icon-source/master.png
- `Title: Amore — Designer Jewelry, Made to Be Loved` --conceptually_related_to--> `Amore — Designer Jewelry Catalogue`  [INFERRED]
  index.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Local Development Emulator Workflow** — readme_firebase_emulator_suite, readme_firestore, readme_firebase_auth, readme_firebase_storage, readme_scripts_seed_emulator [EXTRACTED 1.00]
- **Frontend Technology Stack** — readme_vue_3, readme_vite, readme_typescript, readme_tailwind_css_v4, readme_pinia, readme_firebase, readme_pwa [EXTRACTED 1.00]
- **Production Free-Tier Deployment Flow** — readme_amore_jewelry_catalogue, readme_netlify, readme_vercel, readme_firebase_spark_plan [EXTRACTED 1.00]
- **PWA App Icon Set** — public_icons_apple_touch_icon_appletouchicon, public_icons_icon_192_pwaicon192, public_icons_icon_512_pwaicon512, public_icons_icon_maskable_512_maskableappicon [INFERRED 0.95]
- **Brand Social Link Icon Set** — public_icons_iconssprite, public_icons_blueskyicon, public_icons_discordicon, public_icons_githubicon, public_icons_xicon, public_icons_socialicon, public_icons_documentationicon [EXTRACTED 1.00]
- **Brand Identity Image Assets** — icon_source_master_mastericonsource, public_favicon_favicon, src_assets_hero_heroimage [INFERRED 0.75]

## Communities (56 total, 30 thin omitted)

### Community 0 - "Public Storefront Sections"
Cohesion: 0.06
Nodes (35): bridalProducts, catalogue, { emblaRef, scrollPrev, scrollNext }, nav, catalogue, hasResults, catalogue, catalogue (+27 more)

### Community 1 - "HTML Entry & Shell"
Cohesion: 0.07
Nodes (46): Title: Amore — Designer Jewelry, Made to Be Loved, #app mount point, apple-touch-icon.png, favicon.svg, Google Fonts: Playfair Display + Inter, index.html — App Entry Point, src/main.ts module script, Theme Color #262220 (+38 more)

### Community 2 - "Catalogue State & Types"
Cohesion: 0.06
Nodes (27): CatalogueState, CatalogueFilters, Category, Collection, EMPTY_FILTERS, NamedTaxonomyInput, StyleGroup, StyleTag (+19 more)

### Community 3 - "Contact & Social Links"
Cohesion: 0.06
Nodes (29): instagramLink, props, whatsappLink, link, props, catalogue, handleLabel, instagramLink (+21 more)

### Community 4 - "Core Dependencies"
Cohesion: 0.05
Nodes (36): browser-image-compression, embla-carousel-autoplay, embla-carousel-vue, firebase, @heroicons/vue, dependencies, browser-image-compression, embla-carousel-autoplay (+28 more)

### Community 5 - "Site Header & Nav"
Cohesion: 0.06
Nodes (17): catalogue, categoryItems, collectionItems, isMobileMenuOpen, isSearchOpen, nav, props, styleItems (+9 more)

### Community 6 - "App Shell & Auth"
Cohesion: 0.08
Nodes (20): auth, auth, router, auth, db, firebaseApp, firebaseConfig, app (+12 more)

### Community 7 - "Photo Uploader"
Cohesion: 0.09
Nodes (24): { compress }, emit, isUploading, onFilesSelected(), props, removePhoto(), uploadError, catalogue (+16 more)

### Community 8 - "Admin Category Manager"
Cohesion: 0.08
Nodes (14): addItem(), blockedId, emit, newName, props, removeItem(), emit, catalogue (+6 more)

### Community 9 - "Tooling Config Refs"
Cohesion: 0.08
Nodes (24): ES2023, node, playwright.config.ts, pwa.config.ts, scripts/**/*.ts, vite.config.ts, vitest.config.ts, vitest.rules.config.ts (+16 more)

### Community 10 - "TSConfig Compiler Options"
Cohesion: 0.12
Nodes (15): src/**/*.ts, src/**/*.tsx, src/**/*.vue, vite/client, @vue/tsconfig/tsconfig.dom.json, compilerOptions, allowArbitraryExtensions, erasableSyntaxOnly (+7 more)

### Community 11 - "Emulator Seed Scripts"
Cohesion: 0.21
Nodes (12): app, auth, categories, collections, db, main(), placeholderPhoto(), seedProducts() (+4 more)

### Community 13 - "Brand Icons & PWA Assets"
Cohesion: 0.27
Nodes (10): Master Icon Source, Favicon Brand Mark, Apple Touch Icon, PWA Icon 192px, PWA Icon 512px, Maskable App Icon 512px, Landing Hero Image, Vite Build Tool (+2 more)

### Community 14 - "Lint & Test Toolchain"
Cohesion: 0.22
Nodes (9): eslint, devDependencies, eslint, @playwright/test, prettier, vue-tsc, @playwright/test, prettier (+1 more)

### Community 15 - "Social Icon Sprite"
Cohesion: 0.29
Nodes (7): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Social Icons Sprite, Social Icon, X Icon

## Knowledge Gaps
- **250 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+245 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Lint & Test Toolchain` to `Core Dependencies`, `Cross-Env Dep`, `ESLint Prettier Dep`, `ESLint Core Dep`, `ESLint Vue Plugin Dep`, `Firebase Admin Dep`, `Firebase Rules Test Dep`, `Firebase Tools Dep`, `Globals Dep`, `Jsdom Dep`, `Sharp Dep`, `TailwindCSS Dep`, `Tailwind Vite Dep`, `TSX Dep`, `Node Types Dep`, `TypeScript Dep`, `TS-ESLint Plugin Dep`, `TS-ESLint Parser Dep`, `Vite Dep`, `Vite PWA Plugin Dep`, `Vite Vue Plugin Dep`, `Vitest Dep`, `Vitest Coverage Dep`, `Vue Test Utils Dep`, `Vue TSConfig Dep`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `useCatalogueStore` connect `Public Storefront Sections` to `Contact & Social Links`, `Site Header & Nav`, `App Shell & Auth`, `Photo Uploader`, `Admin Category Manager`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `Product` connect `Contact & Social Links` to `Public Storefront Sections`, `Catalogue State & Types`, `App Shell & Auth`, `Photo Uploader`, `Admin Category Manager`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Amore — Designer Jewelry Catalogue` (e.g. with `Title: Amore — Designer Jewelry, Made to Be Loved` and `index.html — App Entry Point`) actually correct?**
  _`Amore — Designer Jewelry Catalogue` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _250 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Public Storefront Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.0593990216631726 - nodes in this community are weakly interconnected._
- **Should `HTML Entry & Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.06859903381642513 - nodes in this community are weakly interconnected._