/**
 * Seeds placeholder categories/collections/style tags/products and 3 staff
 * auth accounts into the local Firebase Emulator Suite for development and
 * demos. Uses firebase-admin so it writes directly, bypassing security
 * rules (this must never be pointed at a real Firebase project).
 *
 * Usage: with emulators running (npm run emulators), run `npm run seed:emulator`.
 */
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099'

const PROJECT_ID = 'demo-amore'

const app = initializeApp({ projectId: PROJECT_ID })
const db = getFirestore(app)
const auth = getAuth(app)

const categories = [
  'Necklace',
  'Earring',
  'Bangles',
  'Rings',
  'Bracelets',
  'Earchains',
  'Maang Tikka',
  'Hathphool/Sheekhphool',
]

const collections = ['Jadau Kundan', 'Moissanite Kundan', 'Polki Moissanite', 'Diamond']

const styleTags = ['Festive', 'Bridal', 'Antique', 'Minimalistic', 'Long Sets']

const staffAccounts = [
  { email: 'owner@amore.test', password: 'password123', displayName: 'Owner' },
  { email: 'staff1@amore.test', password: 'password123', displayName: 'Staff One' },
  { email: 'staff2@amore.test', password: 'password123', displayName: 'Staff Two' },
]

function placeholderPhoto(seed: number): string {
  return `https://picsum.photos/seed/amore-${seed}/600/800`
}

async function seedTaxonomy(collectionName: string, names: string[]) {
  const ids: string[] = []
  for (const [index, name] of names.entries()) {
    const ref = db.collection(collectionName).doc()
    await ref.set({ name, sortOrder: index, createdAt: Date.now() })
    ids.push(ref.id)
  }
  return ids
}

async function seedProducts(categoryIds: string[], collectionIds: string[], styleTagIds: string[]) {
  const styleGroups: Array<'traditional' | 'modern' | null> = ['traditional', 'modern', null]
  const now = Date.now()

  for (let i = 0; i < 20; i++) {
    const categoryId = categoryIds[i % categoryIds.length]
    const collectionId = i % 3 === 0 ? collectionIds[i % collectionIds.length] : null
    const productStyleTags = i % 2 === 0 ? [styleTagIds[i % styleTagIds.length]] : []
    const ref = db.collection('products').doc()

    await ref.set({
      name: `Placeholder Piece #${i + 1}`,
      priceInr: 3000 + i * 750,
      description: 'Placeholder description — replace with real product copy before launch.',
      photoUrls: [placeholderPhoto(i + 1)],
      categoryId,
      styleTagIds: productStyleTags,
      collectionId,
      isNewArrival: i < 4,
      isFounderFavourite: i % 5 === 0,
      isStatementPick: i % 7 === 0,
      isBridal: i % 6 === 0,
      styleGroup: styleGroups[i % styleGroups.length],
      createdAt: now,
      updatedAt: now,
      createdBy: 'seed-script',
      updatedBy: 'seed-script',
    })
  }
}

async function seedStaffAccounts() {
  for (const account of staffAccounts) {
    try {
      await auth.createUser({
        email: account.email,
        password: account.password,
        displayName: account.displayName,
      })
      console.log(`Created staff account: ${account.email}`)
    } catch (error) {
      console.log(`Skipped ${account.email} (likely already exists): ${(error as Error).message}`)
    }
  }
}

async function main() {
  console.log(`Seeding emulator data for project "${PROJECT_ID}"...`)
  const categoryIds = await seedTaxonomy('categories', categories)
  const collectionIds = await seedTaxonomy('collections', collections)
  const styleTagIds = await seedTaxonomy('styleTags', styleTags)
  await seedProducts(categoryIds, collectionIds, styleTagIds)
  await seedStaffAccounts()
  console.log('Done. 3 staff accounts + 20 placeholder products seeded.')
  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
