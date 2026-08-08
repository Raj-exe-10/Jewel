# Requirements Document
## Business Catalogue Website + Catalogue Manager App
**Date:** August 3, 2026
**Prepared for:** [Business Name]

---

## 1. Project Overview

A single, connected system consisting of:

1. **A public catalogue website** — customers browse products and enquire via WhatsApp or follow on Instagram.
2. **A private catalogue manager app** — a web-based app (installs like a mobile app, no app-store fees) where the owner and staff add, edit, and delete products from their phones.

The two are connected through a shared, free-tier cloud database: any change made in the manager app appears on the live website automatically, within seconds.

---

## 2. Objectives

- Give the business a professional, mobile-friendly online catalogue.
- Make it effortless for customers to enquire or order via WhatsApp.
- Connect visitors to the business's Instagram profile.
- Let the owner and 2 staff manage the catalogue themselves, without a developer, from their own phones.
- Keep the whole system free to run — no hosting costs, no app-store fees.
- Get the whole system live and installed on all devices.

---

## 3. Scope

### In Scope
- One-page public website (catalogue, WhatsApp integration, Instagram integration, responsive design)
- Web-based manager app (PWA), installable on both Android and iPhone
- Multi-user login for the app: owner + 2 staff, each with their own email + password
- Full access for all 3 logins: add, edit, and delete products (no restricted roles)
- Product photo upload from phone camera or gallery
- Category creation/management
- Real-time sync between manager app and public website
- Free deployment to a live URL

### Out of Scope (this phase)
- Publishing to Google Play / Apple App Store
- Online payments / checkout / cart
- Customer accounts or login
- Order management, inventory counts, or sales tracking
- Custom domain purchase (can be added later at low cost)
- Analytics/reporting dashboards
- Multi-location/multi-branch support

---

## 4. Users & Access

| User | Login | Permissions |
|---|---|---|
| Owner | Email + password | Add, edit, delete products; add/remove categories |
| Staff (x2) | Email + password | Add, edit, delete products; add/remove categories (same access as owner) |
| Customers (website visitors) | No login | View catalogue, search/filter, message via WhatsApp, view Instagram link — no editing access |

*New staff logins are created directly by the owner (no public sign-up screen), so only approved people can access the manager app.*

---

## 5. Functional Requirements

### 5.1 Public Website
- **Header & navigation** — business name/logo, links to Catalogue, About, Contact (collapses to a menu on mobile)
- **Hero section** — business name, short tagline, buttons to view catalogue or chat on WhatsApp
- **About section** — short business description
- **Catalogue section**
  - Grid display of all products (supports 20–100+ items)
  - Each product card shows: photo, name, category, price, short description
  - Category filter chips (e.g., "Sarees," "Kurtis," "Accessories")
  - Search box to find a product by name/description
  - "Enquire on WhatsApp" button per product, pre-filled with a message naming that product
- **Contact section** — general WhatsApp enquiry button, Instagram follow button
- **Footer** — social links, business info
- **Floating WhatsApp button** — visible on every scroll position, opens chat directly

### 5.2 Manager App (Catalogue Manager)
- **Login screen** — email + password for owner/staff; friendly error messages for wrong credentials
- **Product list** — searchable list/grid of all current products with thumbnail, name, category, price
- **Add product** — name, category (dropdown), price, description, one or more photos (camera or gallery), with automatic image compression
- **Edit product** — update any field; add or remove photos
- **Delete product** — with a confirmation prompt to prevent accidental deletion
- **Category management** — add or remove categories from within the app
- **Install to home screen** — works full-screen like a native app on both Android and iPhone
- **Logout**

### 5.3 Sync Between App and Website
- Product and category data is stored in one shared database
- Changes made in the manager app (add/edit/delete) reflect on the public website automatically, typically within a few seconds
- No manual "publish" or redeploy step needed for day-to-day catalogue updates

---

## 6. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| **Responsiveness** | Website and app both work cleanly on mobile, tablet, and desktop screens |
| **Cross-platform (app)** | Manager app works on both Android and iPhone via browser install — no app-store distribution |
| **Performance** | Website loads in under 3 seconds on average mobile connection; product list in the app stays fast at 100+ items |
| **Security** | Only logged-in owner/staff can add, edit, or delete products; public visitors have read-only access |
| **Offline behavior (app)** | App shell opens even with a weak connection; saving changes requires an internet connection |
| **Browser support** | Latest Chrome, Safari, Firefox, Edge — mobile and desktop |
| **SEO basics** | Page title, meta description, business name/keywords for discoverability |
| **Ease of use** | Manager app designed for non-technical staff — minimal taps to add or edit a product |

---

## 7. Technical Requirements / Architecture

- **Public website:** Static HTML/CSS/JS site, responsive design
- **Manager app:** Progressive Web App (PWA) — installable via browser, no app-store publishing or fees
- **Shared backend:** Free-tier cloud database and file storage (e.g., Firebase) storing:
  - Product records (name, price, description, category, photo links)
  - Category list
  - Staff/owner login accounts (email + password)
- **Authentication:** Email + password login, managed by the owner (accounts created directly, no public sign-up)
- **Image storage:** Free-tier cloud storage for product photos, linked to each product
- **Hosting:** Free static hosting (e.g., Netlify or Vercel) for both the website and the manager app, served from the same deployment
- **Security rules:** Public read access to products/categories (so the website and any visitor can view them); write access (add/edit/delete) restricted to logged-in users only

---

## 8. Content & Setup Needed From Business Owner

- [ ] Business name, logo (if available), tagline
- [ ] Short "About us" description (2–4 sentences)
- [ ] WhatsApp business number (with country code)
- [ ] Instagram handle/profile link
- [ ] Initial product list: name, image, price, category, short description — for all 20–100 items (can also be entered later directly through the manager app)
- [ ] Staff email addresses (2), for account creation
- [ ] Preferred color scheme/branding style (optional — a design direction has already been proposed)

---

## 9. Success Criteria

- Website is live at a public URL, fully responsive, and displays all products correctly
- WhatsApp buttons open a chat with the correct number and a relevant pre-filled message
- Instagram link correctly directs to the business profile
- Owner and both staff can log in to the manager app from their own phones
- Adding, editing, or deleting a product in the app updates the live website within seconds
- Manager app installs to the home screen on both Android and iPhone, opening full-screen like a native app
- No hosting or app-store costs incurred

---

## 10. Assumptions & Notes

- Since the web-based app route was chosen, there are no Google Play or Apple App Store fees or review delays.
- All three logins (owner + 2 staff) have equal permissions, including delete access, as requested — there are no restricted "staff-only" roles in this phase.
- At a catalogue size of 20–100 products and 3 users, free-tier hosting and database limits comfortably cover expected usage — no cost is expected at this scale.
- New staff accounts, or password resets, are handled directly by the owner through the backend console — no in-app "invite" flow is included in this phase, to keep the system free and simple.
- A custom domain (e.g., yourbusiness.com) isn't included now but can be connected later for a small yearly fee without rebuilding anything.
- Instagram's live feed embedding isn't included by default (it requires separate API approval); the current design links out to the Instagram profile instead.

---

## 11. Suggested Next Steps

1. Confirm/finalize this requirements document.
2. Provide content and assets (Section 8) — business name, WhatsApp number, Instagram handle, logo, initial products.
3. Set up the shared backend (one-time technical setup, ~15 minutes).
4. Personalize the website and app with real business details.
5. Deploy to a live URL.
6. Create staff logins and install the manager app on all phones.
7. Test end-to-end: add a product in the app, confirm it appears on the live website within seconds.
8. Go live.
