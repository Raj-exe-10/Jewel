# Contract: WhatsApp & Instagram Link Builders

These are pure functions (unit-testable without a browser/network) that
produce the outbound links required by FR-006/FR-007/FR-008. Treated as a
contract because the exact URL shape is what makes "opens WhatsApp with the
right pre-filled message" (SC-001, Acceptance Scenario 1.3) verifiable.

## `buildProductEnquiryLink(product: Product, businessPhoneE164: string): string`

- **Input**: a `Product` (at least `name`), and the business WhatsApp number
  in E.164 format without a leading `+` (e.g., `919999999999`).
- **Output**: `https://wa.me/<businessPhoneE164>?text=<url-encoded message>`
- **Message template**: `` Hi Amore, I'm interested in "{product.name}". Could you share more details? ``
- **Contract tests**:
  1. Given a product named `Kundan Choker Necklace`, the returned URL host is
     `wa.me`, the path is `/919999999999`, and the decoded `text` query
     param contains the exact product name.
  2. Product names containing special characters (`&`, `"`, emoji) are
     correctly URL-encoded and round-trip decode back to the original text.
  3. An empty/whitespace-only `businessPhoneE164` throws a descriptive error
     rather than producing a broken link (fail fast in development/tests,
     never ship a dead WhatsApp button).

## `buildGeneralEnquiryLink(businessPhoneE164: string): string`

- **Output**: `https://wa.me/<businessPhoneE164>?text=<url-encoded generic message>`
- **Message template**: `` Hi Amore, I'd like to know more about your jewelry collection. ``
- **Used by**: the floating WhatsApp button (FR-007) and the Contact section's general enquiry button.
- **Contract test**: returned URL is well-formed and does not reference any specific product.

## `buildInstagramProfileLink(instagramHandle: string): string`

- **Output**: `https://instagram.com/<handle-without-leading-@>`
- **Contract tests**:
  1. Handle supplied with a leading `@` is normalized (stripped) in the output.
  2. Handle supplied without `@` is used as-is.
