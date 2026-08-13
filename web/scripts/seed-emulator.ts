/**
 * Seeds placeholder categories/collections/style tags/products, homepage
 * sections, and 3 staff auth accounts into the local Firebase Emulator Suite
 * for development and demos. Uses firebase-admin so it writes directly,
 * bypassing security rules (this must never be pointed at a real Firebase
 * project).
 *
 * Usage: with emulators running (npm run emulators), run `npm run seed:emulator`.
 * Re-runs are idempotent for taxonomies (upsert by name) and skip product
 * reseeding when products already exist.
 */
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { DEFAULT_HOMEPAGE_SECTIONS, toFirestoreSection } from '../src/data/defaultSections'
import { findDuplicateGroups, normalizeTaxonomyName } from '../src/lib/taxonomyDuplicates'

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

/** Jewelry-themed Unsplash placeholders keyed by category name. */
const jewelryPhotos: Record<string, string> = {
  Necklace: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&h=800&q=80',
  Earring: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&h=800&q=80',
  Bangles: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&h=800&q=80',
  Rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&h=800&q=80',
  Bracelets: 'https://images.unsplash.com/photo-1573408301185-51446e1f1da3?auto=format&fit=crop&w=600&h=800&q=80',
  Earchains: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&h=800&q=80',
  'Maang Tikka': 'https://images.unsplash.com/photo-1599643478518-a384e7de4b6b?auto=format&fit=crop&w=600&h=800&q=80',
  'Hathphool/Sheekhphool':
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&h=800&q=80',
}

const productNameByCategory: Record<string, string[]> = {
  Necklace: ['Kundan Choker', 'Temple Haram', 'Polki Layered Necklace', 'Antique Rani Haar'],
  Earring: ['Chandbali Earrings', 'Jhumka Pair', 'Polki Studs', 'Statement Drops'],
  Bangles: ['Kundan Bangle Set', 'Meenakari Kadas', 'Temple Bangles', 'Antique Chooda'],
  Rings: ['Polki Cocktail Ring', 'Kundan Solitaire', 'Temple Band', 'Vintage Signet'],
  Bracelets: ['Delicate Chain Bracelet', 'Kundan Cuff', 'Pearl Tennis Bracelet', 'Antique Kada'],
  Earchains: ['Classic Earchain', 'Pearl Earchain', 'Kundan Earchain', 'Temple Earchain'],
  'Maang Tikka': ['Bridal Maang Tikka', 'Polki Matha Patti', 'Antique Tikka', 'Minimal Tikka'],
  'Hathphool/Sheekhphool': ['Bridal Hathphool', 'Polki Hand Harness', 'Kundan Sheekhphool', 'Pearl Hathphool'],
}

function placeholderPhoto(categoryName: string): string {
  return (
    jewelryPhotos[categoryName] ??
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&h=800&q=80'
  )
}

async function collapseTaxonomyDuplicates(collectionName: string) {
  const snap = await db.collection(collectionName).get()
  const items = snap.docs.map((d) => ({
    id: d.id,
    name: String(d.data().name ?? ''),
    createdAt: Number(d.data().createdAt ?? 0),
  }))
  const groups = findDuplicateGroups(items)
  const remap = new Map<string, string>()
  for (const group of groups) {
    for (const dropId of group.dropIds) {
      remap.set(dropId, group.keepId)
      await db.collection(collectionName).doc(dropId).delete()
    }
  }
  return remap
}

async function remapProductTaxonomyIds(
  categoryRemap: Map<string, string>,
  collectionRemap: Map<string, string>,
  styleTagRemap: Map<string, string>,
) {
  if (categoryRemap.size === 0 && collectionRemap.size === 0 && styleTagRemap.size === 0) return
  const products = await db.collection('products').get()
  for (const productDoc of products.docs) {
    const data = productDoc.data()
    const categoryId = categoryRemap.get(data.categoryId) ?? data.categoryId
    const collectionId =
      data.collectionId == null
        ? null
        : (collectionRemap.get(data.collectionId) ?? data.collectionId)
    const styleTagIds = [
      ...new Set((data.styleTagIds as string[] | undefined)?.map((id) => styleTagRemap.get(id) ?? id) ?? []),
    ]
    const changed =
      categoryId !== data.categoryId ||
      collectionId !== data.collectionId ||
      JSON.stringify(styleTagIds) !== JSON.stringify(data.styleTagIds ?? [])
    if (changed) {
      await productDoc.ref.update({ categoryId, collectionId, styleTagIds })
    }
  }
}

async function seedTaxonomy(collectionName: string, names: string[]) {
  const existing = await db.collection(collectionName).get()
  const byName = new Map<string, string>()
  for (const d of existing.docs) {
    const name = String(d.data().name ?? '')
    const key = normalizeTaxonomyName(name)
    if (!byName.has(key)) byName.set(key, d.id)
  }

  const ids: string[] = []
  for (const [index, name] of names.entries()) {
    const key = normalizeTaxonomyName(name)
    const existingId = byName.get(key)
    if (existingId) {
      await db.collection(collectionName).doc(existingId).set(
        { name, sortOrder: index },
        { merge: true },
      )
      ids.push(existingId)
      continue
    }
    const ref = db.collection(collectionName).doc()
    await ref.set({ name, sortOrder: index, createdAt: Date.now() })
    byName.set(key, ref.id)
    ids.push(ref.id)
  }
  return ids
}

async function seedProducts(categoryIds: string[], collectionIds: string[], styleTagIds: string[]) {
  const existingProducts = await db.collection('products').limit(1).get()
  if (!existingProducts.empty) {
    console.log('Products already present; skipping product seed.')
    return
  }

  const styleGroups: Array<'traditional' | 'modern' | null> = ['traditional', 'modern', null]
  const now = Date.now()

  for (let i = 0; i < 20; i++) {
    const categoryIndex = i % categories.length
    const categoryName = categories[categoryIndex]!
    const categoryId = categoryIds[categoryIndex]!
    const collectionId = i % 3 === 0 ? collectionIds[i % collectionIds.length]! : null
    const productStyleTags = i % 2 === 0 ? [styleTagIds[i % styleTagIds.length]!] : []
    const namesForCategory = productNameByCategory[categoryName] ?? [`Amore Piece #${i + 1}`]
    const name = namesForCategory[i % namesForCategory.length]!
    const ref = db.collection('products').doc()

    await ref.set({
      name,
      priceInr: 3000 + i * 750,
      description: `Handcrafted ${categoryName.toLowerCase()} from the Amore atelier — enquire for custom finishes.`,
      photoUrls: [placeholderPhoto(categoryName)],
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

async function seedHomepageSections() {
  for (const section of DEFAULT_HOMEPAGE_SECTIONS) {
    const { id } = section
    await db.collection('homepageSections').doc(id).set({
      ...toFirestoreSection(section),
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
  const categoryRemap = await collapseTaxonomyDuplicates('categories')
  const collectionRemap = await collapseTaxonomyDuplicates('collections')
  const styleTagRemap = await collapseTaxonomyDuplicates('styleTags')
  await remapProductTaxonomyIds(categoryRemap, collectionRemap, styleTagRemap)

  const categoryIds = await seedTaxonomy('categories', categories)
  const collectionIds = await seedTaxonomy('collections', collections)
  const styleTagIds = await seedTaxonomy('styleTags', styleTags)
  await seedProducts(categoryIds, collectionIds, styleTagIds)
  await seedHomepageSections()
  await seedStaffAccounts()
  console.log('Done. 3 staff accounts + placeholder products + homepage sections seeded.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
