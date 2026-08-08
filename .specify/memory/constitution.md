<!--
Sync Impact Report
- Version change: [TEMPLATE] → 1.0.0 (initial ratification)
- Modified principles: none (first adoption)
- Added sections: Core Principles (7), Technology & Architecture Constraints,
  Development Workflow, Governance
- Removed sections: none
- Templates requiring updates: .specify/templates/spec-template.md (✅ no
  changes needed, generic), .specify/templates/plan-template.md (✅ no changes
  needed, generic), .specify/templates/tasks-template.md (✅ no changes
  needed, generic)
- Follow-up TODOs: none
-->

# Amore Constitution

## Core Principles

### I. Free-Tier Only (NON-NEGOTIABLE)
Every feature, service, and dependency MUST run on a free tier with no
recurring or usage-based cost. This means: no payment gateways, no cart or
checkout, no paid third-party APIs (including the Instagram Graph API), no
purchased custom domain, and no paid tiers of Firebase, hosting, or any other
service. Any new dependency MUST be justified against this constraint before
adoption. Rationale: the project's business goal is a zero-cost, self-service
catalogue system; a single paid dependency undermines that goal for the
entire lifetime of the system.

### II. WhatsApp-First Conversion
Every path to "buy" or "enquire" MUST resolve to a WhatsApp deep link
(`wa.me`) pre-filled with a message identifying the specific product (or a
general enquiry message for non-product contexts). There is no cart,
checkout, or online payment flow. Instagram is linked out to (profile or
individual post/reel embeds); a live Instagram feed sync is explicitly out of
scope because it requires paid/approved API access. Rationale: matches the
approved requirements document and keeps the system free and simple for a
non-technical owner to run.

### III. Single-Page Public Storefront
The public website MUST be a single scrollable page. Navigation items that
imply "pages" in the reference design (Shop by Category, Shop by Collection,
Bridal/Wedding, Statement Picks, etc.) MUST be implemented as scroll-to
anchors that pre-apply filters to one catalogue grid, not as separate routed
pages. The only exception permitted is the protected manager panel, which MAY
live under its own route since it is not part of the public browsing
experience. Rationale: matches the requirements document's explicit "one-page
website" scope while still supporting the rich, multi-section visual
presentation from the approved design reference.

### IV. Test-First Development (NON-NEGOTIABLE)
No production code is written before a failing automated test exists for the
behavior it implements. Every task follows RED (write a failing test) → GREEN
(minimal code to pass) → REFACTOR (clean up, tests stay green). This applies
without exception to authentication, security rules, catalogue filtering
logic, and manager-panel CRUD operations. Code written before its test MUST
be deleted and reimplemented test-first, not retrofitted. Rationale: the
manager panel is used directly by non-technical staff with full delete
access and no restricted roles — untested authentication and data-mutation
code is the highest-risk failure mode in this system.

### V. Equal-Access Staff Accounts, No Public Sign-Up
The manager panel supports exactly three accounts (owner + 2 staff), each
with identical full permissions (add, edit, delete products; manage
categories/collections/tags). Accounts are provisioned directly by the owner
through the Firebase console or an owner-only admin action — there is no
public registration screen and no in-app invite flow. Rationale: keeps the
system simple, free, and matches the explicit assumption in the requirements
document that all three logins are equal and staff onboarding stays manual.

### VI. Mobile-First, Installable Everywhere
Every screen (public storefront and manager panel) MUST be designed
mobile-first and verified on mobile, tablet, and desktop breakpoints. The
entire application MUST be a valid, installable Progressive Web App (manifest
+ service worker) so both customers and staff can install it to their home
screen on Android and iPhone without any app-store distribution. Rationale:
this is the requirements document's explicit "no app-store fees, works like a
native app" mandate.

### VII. Non-Technical Usability & Friendly Failure
The manager panel MUST be usable by non-technical staff with minimal taps per
action: adding or editing a product, uploading a photo, or deleting an item
must never require more steps than necessary. All error states (failed
login, failed upload, network loss) MUST show a plain-language message, never
a raw error code or stack trace. Rationale: the owner and staff are not
developers; a confusing manager panel defeats the entire purpose of a
self-service catalogue.

## Technology & Architecture Constraints

- **Frontend**: Vue 3 (Composition API) + Vite + TypeScript, Pinia for state,
  Vue Router for the public `/` route plus protected `/admin/*` routes,
  Tailwind CSS for styling.
- **PWA**: `vite-plugin-pwa` provides the manifest and service worker for a
  single installable app shell covering both the public storefront and the
  manager panel.
- **Backend**: Firebase Spark (free) plan only — Firestore for
  products/categories/collections/style tags, Firebase Storage for product
  photos, Firebase Authentication (email/password) for the three staff
  accounts.
- **Security rules**: Firestore/Storage rules MUST allow public read access
  to catalogue data and photos, and MUST restrict all writes to authenticated
  users. Security rules are treated as testable code, not configuration to
  "get right by inspection."
- **Testing stack**: Vitest + Vue Test Utils/Testing Library for unit and
  component tests; Firebase Emulator Suite + `@firebase/rules-unit-testing`
  for security-rule and Auth-flow tests; Playwright for a small number of
  critical end-to-end smoke tests. All testing tools MUST be free/open
  source and runnable locally without a paid CI service.
  Playwright's browser download is treated as a free tooling dependency, not
  a service cost.
- **Hosting**: Netlify or Vercel free tier, one deployment serving both the
  public storefront and the manager panel.
- **Explicitly excluded**: payment SDKs, paid analytics/reporting, paid
  map/geolocation APIs, Instagram Graph API, purchased custom domains,
  multi-branch/location support, customer accounts.

## Development Workflow

- Requirements are formalized through Spec Kit
  (`/speckit-constitution → speckit-specify → speckit-clarify → speckit-plan
  → speckit-checklist → speckit-tasks → speckit-analyze`) before
  implementation begins. Specs describe *what/why*; this constitution and the
  plan describe *how*.
- Implementation of each task generated by `/speckit-tasks` is carried out
  under the Superpowers skills framework (`test-driven-development`,
  `subagent-driven-development`, `requesting-code-review` /
  `receiving-code-review`, `verification-before-completion`). Superpowers'
  own `brainstorming` and `writing-plans` skills are not used, since Spec Kit
  already owns that phase for this project.
- A task is only considered complete when: its test(s) were watched failing
  first, the implementation makes them pass, no other tests regressed, and a
  code-review pass has been completed against the plan.
- Authentication, route guards, and security rules are prioritized first in
  the implementation order, ahead of storefront visual polish, because every
  other feature's data-safety depends on them.

## Governance

This constitution supersedes ad hoc practices and prior informal agreements
for this project. Any amendment MUST update the version per semantic
versioning (MAJOR: incompatible principle removal/redefinition; MINOR: new
principle or materially expanded guidance; PATCH: clarification/wording),
record the change in a Sync Impact Report at the top of this file, and update
the `Last Amended` date below. All specs, plans, and task lists produced by
Spec Kit MUST be checked for compliance with these principles during
`/speckit-analyze`; any conflict is resolved in favor of this constitution
unless the user explicitly overrides it in writing for a specific case.

**Version**: 1.0.0 | **Ratified**: 2026-08-08 | **Last Amended**: 2026-08-08
