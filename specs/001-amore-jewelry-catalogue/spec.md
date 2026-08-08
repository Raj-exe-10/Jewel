# Feature Specification: Amore Jewelry Catalogue Website & Manager Panel

**Feature Branch**: `001-amore-jewelry-catalogue`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "A public jewelry catalogue website called 'Amore', styled after mortantra.com, that lets customers browse products by category/collection/occasion and enquire via WhatsApp or follow on Instagram, with no cart or payment. Connected to it, a protected manager panel where the owner and two staff (equal permissions) add, edit, and delete products and categories from their phones. Everything must run on free-tier services only. The whole system must be installable as a Progressive Web App on Android and iPhone."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and enquire about a product (Priority: P1)

A visitor lands on the Amore site on their phone, scrolls through curated visuals and the full catalogue, narrows down products using the category/collection/style navigation and search, and taps "Enquire on WhatsApp" on a piece she likes, landing in a WhatsApp chat with a message that already names the product.

**Why this priority**: This is the entire commercial purpose of the site — every other feature exists to get a visitor to this action. Without it, the site has no business value.

**Independent Test**: Can be fully tested by opening the deployed site on a mobile browser, browsing the catalogue without logging in, and confirming the WhatsApp button opens a chat pre-filled with a message naming the correct product. Delivers value on its own even with a handful of seeded products.

**Acceptance Scenarios**:

1. **Given** a visitor on the homepage, **When** they scroll to the catalogue and tap a category chip (e.g., "Necklace"), **Then** the grid shows only products in that category without a page reload.
2. **Given** a visitor viewing the catalogue, **When** they type a product name or keyword into the search box, **Then** matching products appear and non-matching products are hidden.
3. **Given** a visitor viewing any product card, **When** they tap "Enquire on WhatsApp", **Then** a WhatsApp chat opens (app or web) addressed to the business number with a pre-filled message that includes the product's name.
4. **Given** a visitor anywhere on the page, **When** they scroll up or down, **Then** a floating WhatsApp button remains visible and tappable at all times.
5. **Given** a visitor on the Contact section, **When** they tap the Instagram button, **Then** their Instagram app or browser opens directly to the business profile.

---

### User Story 2 - Discover via curated visual sections (Priority: P2)

A visitor arrives with no specific product in mind and is drawn in by an editorial homepage experience — a video/photo hero ("Shop the Visuals"), a curated "Founder's Favourites" grid, and a "Shop the Style" section split into Traditional and Modern picks — each of which leads into the filtered catalogue when tapped.

**Why this priority**: This recreates the browsing/inspiration experience of the reference design (mortantra.com) and is what differentiates Amore from a bare product list, increasing time-on-site and the chance of a WhatsApp enquiry. It is not required for the core transaction to work, so it is P2.

**Independent Test**: Can be tested by loading the homepage and confirming each curated section renders its own curated subset of products/media and that tapping an item or tile scrolls to the catalogue pre-filtered accordingly, independent of the general search/filter feature.

**Acceptance Scenarios**:

1. **Given** the homepage loads, **When** the hero section renders, **Then** it displays a looping video/image carousel under a "Shop the Visuals" heading.
2. **Given** the homepage, **When** the visitor reaches "Founder's Favourites", **Then** they see a curated grid of products flagged as favourites by the owner/staff, each with the same enquire action as any catalogue card.
3. **Given** the homepage, **When** the visitor reaches "Shop the Style", **Then** products are grouped under "Traditional" and "Modern" headings, each tappable to view more of that style in the catalogue.
4. **Given** the mega-menu (Shop by Category, Shop by Collection, Bridal/Wedding, Statement Picks), **When** a visitor selects any menu item or sub-item, **Then** the page scrolls to the catalogue with the matching filter(s) already applied.

---

### User Story 3 - Manage the catalogue from a phone (Priority: P1)

The owner or a staff member logs into the manager panel from their phone, adds a new product with photos taken directly from the camera, edits an existing product's price or description, deletes a discontinued item after confirming, and manages the list of categories/collections/style tags — all without needing a developer.

**Why this priority**: The entire value proposition of the system (a self-service catalogue the business can run without ongoing developer help) depends on this working reliably. It is equally critical to User Story 1, since without it the catalogue can never be updated.

**Independent Test**: Can be fully tested by logging into the manager panel with a staff account, adding a product with a photo, and confirming it appears correctly (without a redeploy) in the public catalogue from User Story 1. Delivers value independently as an internal tool even before public traffic arrives.

**Acceptance Scenarios**:

1. **Given** the manager panel login screen, **When** the owner or a staff member enters a valid email/password, **Then** they reach the product list; **When** they enter incorrect credentials, **Then** a plain-language error is shown (no technical error codes).
2. **Given** a logged-in staff member on "Add Product", **When** they fill in name, category, price, description, and attach one or more photos (camera or gallery) and save, **Then** the product appears in the manager's product list and, within a few seconds, on the public catalogue.
3. **Given** a logged-in staff member editing an existing product, **When** they change any field or add/remove a photo and save, **Then** the public catalogue reflects the change within a few seconds without any manual publish/redeploy step.
4. **Given** a logged-in staff member on a product, **When** they choose delete, **Then** a confirmation prompt appears before the product is permanently removed from both the manager list and the public site.
5. **Given** a logged-in staff member on category/collection/style-tag management, **When** they add or remove an entry, **Then** it becomes available/unavailable as a filter option on the public catalogue accordingly.
6. **Given** an unauthenticated visitor, **When** they attempt to open the manager panel URL directly, **Then** they are redirected to the login screen and cannot view or modify any product data.
7. **Given** any of the three accounts (owner or either staff member) is logged in, **When** they perform any add/edit/delete action, **Then** the action succeeds identically regardless of which of the three accounts performed it (no restricted roles).

---

### User Story 4 - Install as an app on a phone (Priority: P3)

A returning customer or staff member installs the site/manager panel to their phone's home screen so it opens full-screen like a native app, without visiting an app store.

**Why this priority**: Improves convenience and return-visit rate for both audiences, but the site and manager panel are already fully usable from a mobile browser without this, so it is the lowest priority of the four.

**Independent Test**: Can be tested by opening the deployed site in a mobile browser, using the browser's "Add to Home Screen"/install prompt, and confirming the resulting icon opens the app full-screen (no browser address bar) with a working offline-capable app shell.

**Acceptance Scenarios**:

1. **Given** a visitor on a supported mobile browser, **When** they use "Add to Home Screen" (or the browser's install prompt), **Then** an Amore icon is added and opens the site full-screen.
2. **Given** the app was installed and the device later has a weak/no connection, **When** it is opened, **Then** the app shell (layout/navigation) still loads, even if fresh product data cannot be fetched.
3. **Given** a staff member, **When** they install the manager panel the same way, **Then** it opens directly to the login screen (or product list if already authenticated) full-screen.

---

### Edge Cases

- What happens when the catalogue has zero products matching the selected filter/search combination? System MUST show a friendly "no products found" state rather than a blank grid.
- What happens when a product photo fails to upload (e.g., connection drops mid-upload)? Manager panel MUST show a clear retry-able error and MUST NOT save a product with a broken/missing image reference.
- What happens when a staff member tries to delete the last remaining category that is still assigned to existing products? System MUST warn that products using it will become uncategorized (or block deletion) rather than silently breaking product listings.
- What happens when two staff members edit the same product at nearly the same time? The later save MUST win without corrupting the record (last-write-wins is acceptable for this scale).
- What happens when a visitor's device has no WhatsApp installed? The WhatsApp link MUST fall back to WhatsApp Web in a browser tab rather than failing silently.
- What happens when the manager panel is opened on a very weak connection? Read operations (viewing the product list) MAY show cached/stale data with an indicator; write operations (save/delete) MUST require a successful connection and MUST NOT silently fail.
- What happens when an incorrect password is entered repeatedly? System MUST continue showing a friendly error without locking the UI or exposing whether the email exists.

## Requirements *(mandatory)*

### Functional Requirements

**Public storefront**

- **FR-001**: System MUST display a single-page public storefront reachable without login, containing: header/navigation, hero/visuals section, curated "Founder's Favourites" section, "Shop the Style" section, a full catalogue grid, an about section, a contact section, and a footer.
- **FR-002**: System MUST render a mega-menu navigation (Home, New Arrival, Shop by Category, Shop by Collection, Bridal/Wedding, Statement Picks) where every item scrolls to the catalogue section with the corresponding filter(s) pre-applied.
- **FR-003**: System MUST support category filtering (e.g., Necklace, Earring, Bangles, Rings, Bracelets, Earchains, Maang Tikka, Hathphool/Sheekhphool), each combinable with style sub-tags (e.g., Festive, Bridal, Antique, Minimalistic, Long Sets) and collection filters (e.g., Jadau Kundan, Moissanite Kundan, Polki Moissanite, Diamond).
- **FR-004**: System MUST provide a text search across product name and description that updates the visible catalogue grid without a page reload.
- **FR-005**: Each product card MUST display at minimum: photo, name, category, price, short description, and an "Enquire on WhatsApp" action.
- **FR-006**: The "Enquire on WhatsApp" action MUST open a chat with the configured business WhatsApp number with a pre-filled message that includes the specific product's name.
- **FR-007**: System MUST provide a persistent floating WhatsApp button visible at every scroll position on the storefront, opening a general enquiry chat.
- **FR-008**: System MUST provide an Instagram follow action/link that opens the configured business Instagram profile.
- **FR-009**: System MUST allow visitors to mark/unmark products as favorites ("wishlist") for the duration of their browser session/device, with no login required and no account data stored server-side.
- **FR-010**: System MUST display curated sections ("Founder's Favourites", "Shop the Style: Traditional/Modern", "New Arrival") driven by flags/tags set by the owner/staff in the manager panel, not hardcoded in the site.
- **FR-011**: System MUST remain fully usable (all browsing, filtering, search, and WhatsApp/Instagram actions) on mobile, tablet, and desktop screen sizes.
- **FR-012**: System MUST NOT expose any cart, checkout, payment, or customer account/login functionality on the public storefront.

**Manager panel**

- **FR-013**: System MUST provide a manager panel, reachable only after authentication, for adding, editing, and deleting products and for managing categories/collections/style tags.
- **FR-014**: System MUST authenticate exactly three accounts (owner + 2 staff) via email + password; there is no public self-registration screen.
- **FR-015**: All three authenticated accounts MUST have identical permissions (add, edit, delete products; add/remove categories/collections/tags) — no restricted/staff-only role exists.
- **FR-016**: System MUST let an authenticated user add a product with: name, category, price, description, one or more photos (from camera or device gallery), and optional flags (new arrival, founder's favourite, style group, statement pick, bridal).
- **FR-017**: System MUST let an authenticated user edit any field of an existing product, including adding or removing photos.
- **FR-018**: System MUST let an authenticated user delete a product only after an explicit confirmation step.
- **FR-019**: System MUST let an authenticated user add or remove categories, collections, and style tags used for public filtering.
- **FR-020**: System MUST compress product photos on the device before upload to keep storage/bandwidth usage low.
- **FR-021**: System MUST show plain-language error messages for authentication failures and for save/upload/delete failures — never a raw technical error.
- **FR-022**: System MUST redirect any unauthenticated attempt to access manager-panel screens to the login screen.
- **FR-023**: System MUST provide a logout action from the manager panel.
- **FR-024**: Any product/category/collection/tag change saved in the manager panel MUST become visible on the public storefront within a few seconds, without a manual publish step or redeploy.

**Cross-cutting**

- **FR-025**: System MUST be installable to a phone's home screen (Android and iPhone) directly from the browser, opening full-screen like a native app, for both the public storefront and the manager panel.
- **FR-026**: System MUST allow the app shell (layout/navigation) to open even when the device has a weak or no network connection; saving or reading fresh data still requires connectivity.
- **FR-027**: System MUST run entirely on free-tier hosting, database, storage, and authentication services, with no payment gateway, no paid third-party APIs, and no purchased domain required to be live.
- **FR-028**: System MUST include basic SEO metadata (page title, meta description, relevant business/product keywords) on the public storefront.
- **FR-029**: System MUST restrict all catalogue write operations (create/update/delete of products, categories, collections, tags) to authenticated accounts, while keeping all catalogue read operations publicly accessible without login.

### Key Entities

- **Product**: A single jewelry item shown in the catalogue. Attributes: name, price, short description, one or more photos, category, optional style sub-tags, optional collection, optional flags (new arrival, founder's favourite, style group traditional/modern, statement pick, bridal/wedding), creation/update timestamps.
- **Category**: A top-level grouping used for filtering and navigation (e.g., Necklace, Earring, Bangles, Rings, Bracelets, Earchains, Maang Tikka, Hathphool/Sheekhphool). Managed by owner/staff.
- **Collection**: A cross-category grouping used for filtering (e.g., Jadau Kundan, Moissanite Kundan, Polki Moissanite, Diamond). Managed by owner/staff.
- **Style Tag**: A secondary descriptor applied to products for finer filtering (e.g., Festive, Bridal, Antique, Minimalistic, Long Sets). Managed by owner/staff.
- **Staff Account**: One of exactly three login identities (owner + 2 staff) with equal permissions, authenticated by email + password, created directly by the owner (no public sign-up).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can go from landing on the homepage to opening a WhatsApp chat about a specific product in under 60 seconds without any instruction.
- **SC-002**: The catalogue remains responsive (filter/search results appear in under 1 second) with at least 100 products loaded.
- **SC-003**: A non-technical staff member can add a new product (name, category, price, description, one photo) from their phone in under 2 minutes on their first attempt.
- **SC-004**: A change made in the manager panel (add, edit, or delete) is visible on the public storefront within 10 seconds, with no manual publish or redeploy step, in at least 95% of attempts.
- **SC-005**: The public storefront loads and becomes interactive in under 3 seconds on an average mobile connection.
- **SC-006**: 100% of unauthenticated attempts to reach manager-panel screens or to write catalogue data are blocked.
- **SC-007**: The system incurs $0 in recurring hosting, database, storage, or API costs at a catalogue size of 20-100 products and 3 manager accounts.
- **SC-008**: Both the public storefront and the manager panel can be installed to the home screen and opened full-screen on both a current Android phone and a current iPhone.

## Assumptions

- "Amore" is the confirmed brand name; real logo, tagline, exact color palette, WhatsApp number, and Instagram handle will be supplied later and are placeholder-driven until then.
- The public storefront is a single scrollable page; every item in the sketch's mega-menu (Shop by Category/Collection, Bridal/Wedding, Statement Picks) is implemented as a pre-filter into one catalogue grid rather than a separate page, per the approved requirements document.
- The wishlist/favorites feature (FR-009) is a lightweight, session/device-local convenience with no account system, login, or cross-device sync, since customer accounts are explicitly out of scope.
- "Shop the Visuals" hero media may start as placeholder video/image assets and/or simple links to individual Instagram posts/reels; a live-synced Instagram feed is out of scope because it requires paid/approved API access.
- Initial catalogue content (products, categories, collections, style tags, media) will be placeholder/mock data seeded for development and demonstration, to be replaced with real business content later without requiring structural changes.
- New staff accounts and password resets continue to be handled directly by the owner outside of any public UI, consistent with the requirements document.
- "A few seconds" / "within seconds" sync latency (FR-024, SC-004) is defined for testing purposes as within 10 seconds under normal connectivity.
- Multi-location/branch support, order/inventory tracking, analytics dashboards, and a purchased custom domain remain explicitly out of scope for this feature.
