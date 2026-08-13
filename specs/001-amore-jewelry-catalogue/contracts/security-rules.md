# Contract: Firestore & Storage Security Rules

This is the access-control contract the app is built against. It is the
primary "external interface" for this project (there is no custom backend
API — Firestore/Storage rules ARE the API contract). `tests/rules/*` MUST
assert every row of the tables below against the Firebase Emulator Suite
before the corresponding application feature is considered done, per
Constitution Principle IV.

## Firestore (`firestore.rules`)

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /collections/{collectionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /styleTags/{styleTagId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /staff/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }

    match /homepageSections/{sectionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /homepageConfig/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Storage (`storage.rules`)

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-photos/{allPaths=**} {
      allow read: if true;
      // create/update (uploads) carry a request.resource to validate;
      // delete does not, so it is authorized separately.
      allow create, update: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null;
    }

    match /section-media/{allPaths=**} {
      allow read: if true;
      allow create, update: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null;
    }

    match /section-videos/{allPaths=**} {
      allow read: if true;
      allow create, update: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024
                   && request.resource.contentType.matches('video/.*');
      allow delete: if request.auth != null;
    }
  }
}
```

## Contract test matrix (`tests/rules/*.spec.ts`)

| # | Actor | Operation | Target | Expected |
|---|---|---|---|---|
| 1 | Unauthenticated | read | any `products/{id}` | ALLOW |
| 2 | Unauthenticated | create/update/delete | `products/{id}` | DENY |
| 3 | Authenticated (any of the 3 test accounts) | create | `products/{id}` | ALLOW |
| 4 | Authenticated | update | `products/{id}` | ALLOW |
| 5 | Authenticated | delete | `products/{id}` | ALLOW |
| 6 | Authenticated (account A) | update | product previously created by account B | ALLOW (equal permissions, Constitution V) |
| 7 | Unauthenticated | read | `categories`, `collections`, `styleTags` | ALLOW |
| 8 | Unauthenticated | write | `categories`, `collections`, `styleTags` | DENY |
| 9 | Unauthenticated | read | `product-photos/**` (Storage) | ALLOW |
| 10 | Unauthenticated | write | `product-photos/**` (Storage) | DENY |
| 11 | Authenticated | write | `product-photos/**` with `contentType: image/jpeg`, size < 5MB | ALLOW |
| 12 | Authenticated | write | `product-photos/**` with `contentType: application/pdf` | DENY |
| 13 | Authenticated | write | `product-photos/**` with size >= 5MB | DENY |
| 14 | User A | write | `staff/{uidB}` (another user's mirror doc) | DENY |
| 15 | User A | write | `staff/{uidA}` (own mirror doc) | ALLOW |
| 16 | Unauthenticated | read | `homepageSections/{id}` | ALLOW |
| 17 | Unauthenticated | write | `homepageSections/{id}` | DENY |
| 18 | Authenticated | write | `homepageSections/{id}` | ALLOW |
| 19 | Unauthenticated | read | `section-media/**` (Storage) | ALLOW |
| 20 | Unauthenticated | write | `section-media/**` (Storage) | DENY |
| 21 | Authenticated | write | `section-media/**` with `contentType: image/jpeg`, size < 5MB | ALLOW |
| 22 | Authenticated | write | `section-videos/**` with `contentType: video/mp4`, size < 50MB | ALLOW |
| 23 | Authenticated | write | `section-videos/**` with `contentType: image/jpeg` | DENY |
| 24 | Unauthenticated | write | `section-videos/**` | DENY |
| 25 | Unauthenticated | read | `homepageConfig/{id}` | ALLOW |
| 26 | Unauthenticated | write | `homepageConfig/{id}` | DENY |
| 27 | Authenticated | write | `homepageConfig/{id}` | ALLOW |

Every row above corresponds to one Vitest test using
`@firebase/rules-unit-testing`'s `assertSucceeds`/`assertFails` against the
local Firestore/Storage emulators — no real project or cost involved.
