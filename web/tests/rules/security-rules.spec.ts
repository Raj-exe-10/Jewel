import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage'

// Contract under test: specs/001-amore-jewelry-catalogue/contracts/security-rules.md
// Row numbers in test names below refer to that contract's test matrix.

let testEnv: RulesTestEnvironment

const PROJECT_ID = 'demo-amore'

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
    storage: {
      rules: readFileSync(resolve(__dirname, '../../storage.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 9199,
    },
  })
})

afterAll(async () => {
  await testEnv?.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.clearStorage()
})

describe('Firestore: products (rows 1-6)', () => {
  it('row 1: unauthenticated read is ALLOWED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertSucceeds(getDoc(doc(unauth.firestore(), 'products/p1')))
  })

  it('row 2: unauthenticated create is DENIED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(setDoc(doc(unauth.firestore(), 'products/p1'), { name: 'x' }))
  })

  it('row 3: authenticated create is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(setDoc(doc(userA.firestore(), 'products/p1'), { name: 'x' }))
  })

  it('row 4: authenticated update is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await setDoc(doc(userA.firestore(), 'products/p1'), { name: 'x' })
    await assertSucceeds(updateDoc(doc(userA.firestore(), 'products/p1'), { name: 'y' }))
  })

  it('row 5: authenticated delete is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await setDoc(doc(userA.firestore(), 'products/p1'), { name: 'x' })
    await assertSucceeds(deleteDoc(doc(userA.firestore(), 'products/p1')))
  })

  it('row 6: any authenticated account can edit a product created by another account (equal permissions)', async () => {
    const userA = testEnv.authenticatedContext('userA')
    const userB = testEnv.authenticatedContext('userB')
    await setDoc(doc(userA.firestore(), 'products/p1'), { name: 'created-by-a' })
    await assertSucceeds(updateDoc(doc(userB.firestore(), 'products/p1'), { name: 'edited-by-b' }))
  })
})

describe('Firestore: categories/collections/styleTags (rows 7-8)', () => {
  const taxonomies = ['categories', 'collections', 'styleTags']

  it.each(taxonomies)('row 7: unauthenticated read of %s is ALLOWED', async (taxonomy) => {
    const unauth = testEnv.unauthenticatedContext()
    await assertSucceeds(getDoc(doc(unauth.firestore(), `${taxonomy}/t1`)))
  })

  it.each(taxonomies)('row 8: unauthenticated write of %s is DENIED', async (taxonomy) => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(setDoc(doc(unauth.firestore(), `${taxonomy}/t1`), { name: 'x' }))
  })
})

describe('Storage: product-photos (rows 9-13)', () => {
  it('row 9: unauthenticated read is ALLOWED', async () => {
    const admin = testEnv.authenticatedContext('userA')
    await uploadBytes(ref(admin.storage(), 'product-photos/p1.jpg'), new Uint8Array([1, 2, 3]), {
      contentType: 'image/jpeg',
    })
    const unauth = testEnv.unauthenticatedContext()
    await assertSucceeds(getBytes(ref(unauth.storage(), 'product-photos/p1.jpg')))
  })

  it('row 10: unauthenticated write is DENIED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(
      uploadBytes(ref(unauth.storage(), 'product-photos/p1.jpg'), new Uint8Array([1, 2, 3]), {
        contentType: 'image/jpeg',
      }),
    )
  })

  it('row 11: authenticated write of a small image is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(
      uploadBytes(ref(userA.storage(), 'product-photos/p1.jpg'), new Uint8Array([1, 2, 3]), {
        contentType: 'image/jpeg',
      }),
    )
  })

  it('row 12: authenticated write of a non-image content type is DENIED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertFails(
      uploadBytes(ref(userA.storage(), 'product-photos/doc.pdf'), new Uint8Array([1, 2, 3]), {
        contentType: 'application/pdf',
      }),
    )
  })

  it('row 13: authenticated write of an oversized image (>=5MB) is DENIED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    const oversized = new Uint8Array(5 * 1024 * 1024 + 1)
    await assertFails(
      uploadBytes(ref(userA.storage(), 'product-photos/big.jpg'), oversized, {
        contentType: 'image/jpeg',
      }),
    )
  })
})

describe('Firestore: staff mirror docs (rows 14-15)', () => {
  it("row 14: a user cannot write another user's staff mirror doc", async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertFails(setDoc(doc(userA.firestore(), 'staff/userB'), { displayName: 'x' }))
  })

  it('row 15: a user can write their own staff mirror doc', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(setDoc(doc(userA.firestore(), 'staff/userA'), { displayName: 'x' }))
  })
})

describe('Storage: product-photos deletion follows the same write rule', () => {
  it('authenticated delete is ALLOWED (write covers delete)', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await uploadBytes(ref(userA.storage(), 'product-photos/p1.jpg'), new Uint8Array([1, 2, 3]), {
      contentType: 'image/jpeg',
    })
    await assertSucceeds(deleteObject(ref(userA.storage(), 'product-photos/p1.jpg')))
  })
})

// Sanity check that the matrix above covers exactly the 15 documented rows.
describe('Firestore: homepageSections', () => {
  it('row 16: unauthenticated read is ALLOWED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertSucceeds(getDoc(doc(unauth.firestore(), 'homepageSections/s1')))
  })

  it('row 17: unauthenticated write is DENIED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(setDoc(doc(unauth.firestore(), 'homepageSections/s1'), { title: 'x' }))
  })

  it('row 18: authenticated write is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(setDoc(doc(userA.firestore(), 'homepageSections/s1'), { title: 'x' }))
  })
})

describe('Storage: section media and videos', () => {
  it('row 19: unauthenticated read of section-media is ALLOWED', async () => {
    const admin = testEnv.authenticatedContext('userA')
    await uploadBytes(ref(admin.storage(), 'section-media/hero.jpg'), new Uint8Array([1, 2, 3]), {
      contentType: 'image/jpeg',
    })
    const unauth = testEnv.unauthenticatedContext()
    await assertSucceeds(getBytes(ref(unauth.storage(), 'section-media/hero.jpg')))
  })

  it('row 20: unauthenticated write of section-media is DENIED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(
      uploadBytes(ref(unauth.storage(), 'section-media/hero.jpg'), new Uint8Array([1, 2, 3]), {
        contentType: 'image/jpeg',
      }),
    )
  })

  it('row 21: authenticated write of a small section image is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(
      uploadBytes(ref(userA.storage(), 'section-media/hero.jpg'), new Uint8Array([1, 2, 3]), {
        contentType: 'image/jpeg',
      }),
    )
  })

  it('row 22: authenticated write of a video is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(
      uploadBytes(ref(userA.storage(), 'section-videos/clip.mp4'), new Uint8Array([1, 2, 3]), {
        contentType: 'video/mp4',
      }),
    )
  })

  it('row 23: authenticated write of a non-video to section-videos is DENIED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertFails(
      uploadBytes(ref(userA.storage(), 'section-videos/clip.jpg'), new Uint8Array([1, 2, 3]), {
        contentType: 'image/jpeg',
      }),
    )
  })

  it('row 24: unauthenticated write of section-videos is DENIED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(
      uploadBytes(ref(unauth.storage(), 'section-videos/clip.mp4'), new Uint8Array([1, 2, 3]), {
        contentType: 'video/mp4',
      }),
    )
  })
})

describe('Firestore: homepageConfig', () => {
  it('row 25: unauthenticated read is ALLOWED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertSucceeds(getDoc(doc(unauth.firestore(), 'homepageConfig/defaultLayout')))
  })

  it('row 26: unauthenticated write is DENIED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(
      setDoc(doc(unauth.firestore(), 'homepageConfig/defaultLayout'), { sections: [] }),
    )
  })

  it('row 27: authenticated write is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(
      setDoc(doc(userA.firestore(), 'homepageConfig/defaultLayout'), { sections: [] }),
    )
  })
})

describe('Firestore: catalogueConfig', () => {
  it('allows unauthenticated reads', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertSucceeds(getDoc(doc(unauth.firestore(), 'catalogueConfig/collectionPage')))
  })

  it('denies unauthenticated writes and allows authenticated writes', async () => {
    const unauth = testEnv.unauthenticatedContext()
    const userA = testEnv.authenticatedContext('userA')
    await assertFails(
      setDoc(doc(unauth.firestore(), 'catalogueConfig/collectionPage'), { productsPerRow: 10 }),
    )
    await assertSucceeds(
      setDoc(doc(userA.firestore(), 'catalogueConfig/collectionPage'), { productsPerRow: 10 }),
    )
  })
})

describe('Storage: product-videos', () => {
  it('row 28: unauthenticated write of product-videos is DENIED', async () => {
    const unauth = testEnv.unauthenticatedContext()
    await assertFails(
      uploadBytes(ref(unauth.storage(), 'product-videos/clip.mp4'), new Uint8Array([1, 2, 3]), {
        contentType: 'video/mp4',
      }),
    )
  })

  it('row 29: authenticated write of a product video is ALLOWED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertSucceeds(
      uploadBytes(ref(userA.storage(), 'product-videos/clip.mp4'), new Uint8Array([1, 2, 3]), {
        contentType: 'video/mp4',
      }),
    )
  })

  it('row 30: authenticated write of a non-video to product-videos is DENIED', async () => {
    const userA = testEnv.authenticatedContext('userA')
    await assertFails(
      uploadBytes(ref(userA.storage(), 'product-videos/clip.jpg'), new Uint8Array([1, 2, 3]), {
        contentType: 'image/jpeg',
      }),
    )
  })
})

describe('contract coverage', () => {
  it('documents 30 rows in the security-rules contract', () => {
    const contract = readFileSync(
      resolve(__dirname, '../../../specs/001-amore-jewelry-catalogue/contracts/security-rules.md'),
      'utf8',
    )
    const rows = contract.match(/^\| \d+ \|/gm) ?? []
    expect(rows).toHaveLength(30)
  })
})
