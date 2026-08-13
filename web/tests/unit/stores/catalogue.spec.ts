import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category, Collection, Product, StyleTag } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
}))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: overrides.id ?? 'p1',
    name: 'Kundan Choker Necklace',
    priceInr: 5000,
    description: 'A lovely necklace',
    photoUrls: ['https://example.com/photo.jpg'],
    categoryId: 'cat-necklace',
    styleTagIds: [],
    collectionId: null,
    isNewArrival: false,
    isFounderFavourite: false,
    isStatementPick: false,
    isBridal: false,
    styleGroup: null,
    createdAt: 0,
    updatedAt: 0,
    createdBy: 'uid1',
    updatedBy: 'uid1',
    ...overrides,
  }
}

const category: Category = { id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }
const category2: Category = { id: 'cat-ring', name: 'Rings', sortOrder: 1, createdAt: 0 }
const collection: Collection = { id: 'col-kundan', name: 'Jadau Kundan', sortOrder: 0, createdAt: 0 }
const styleTag: StyleTag = { id: 'tag-bridal', name: 'Bridal', sortOrder: 0, createdAt: 0 }

describe('catalogue store filtering/search', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns all products when no filters are applied', () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2', categoryId: 'cat-ring' })],
      categories: [category, category2],
    })

    expect(store.filteredProducts).toHaveLength(2)
  })

  it('filters by category', () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [
        makeProduct({ id: 'p1', categoryId: 'cat-necklace' }),
        makeProduct({ id: 'p2', categoryId: 'cat-ring' }),
      ],
    })

    store.setFilters({ categoryId: 'cat-ring' })

    expect(store.filteredProducts).toHaveLength(1)
    expect(store.filteredProducts[0].id).toBe('p2')
  })

  it('filters by collection', () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [
        makeProduct({ id: 'p1', collectionId: 'col-kundan' }),
        makeProduct({ id: 'p2', collectionId: null }),
      ],
    })

    store.setFilters({ collectionId: 'col-kundan' })

    expect(store.filteredProducts.map((p) => p.id)).toEqual(['p1'])
  })

  it('filters by style tag', () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [
        makeProduct({ id: 'p1', styleTagIds: ['tag-bridal'] }),
        makeProduct({ id: 'p2', styleTagIds: [] }),
      ],
    })

    store.setFilters({ styleTagId: 'tag-bridal' })

    expect(store.filteredProducts.map((p) => p.id)).toEqual(['p1'])
  })

  it('filters by search keyword across name and description, case-insensitively', () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [
        makeProduct({ id: 'p1', name: 'Kundan Choker Necklace' }),
        makeProduct({ id: 'p2', name: 'Diamond Ring', description: 'elegant kundan work' }),
        makeProduct({ id: 'p3', name: 'Plain Bangle', description: 'gold bangle' }),
      ],
    })

    store.setFilters({ searchTerm: 'KUNDAN' })

    expect(store.filteredProducts.map((p) => p.id).sort()).toEqual(['p1', 'p2'])
  })

  it('matches products when the search term is a category name', () => {
    const store = useCatalogueStore()
    store.$patch({
      categories: [category, category2],
      products: [
        makeProduct({
          id: 'p1',
          categoryId: 'cat-necklace',
          name: 'Heritage Haar',
          description: 'handcrafted bridal set',
        }),
        makeProduct({
          id: 'p2',
          categoryId: 'cat-ring',
          name: 'Solitaire Band',
          description: 'everyday gold band',
        }),
      ],
    })

    store.setFilters({ searchTerm: 'necklace' })

    expect(store.filteredProducts.map((p) => p.id)).toEqual(['p1'])
  })

  it('combines multiple filters (category AND search)', () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [
        makeProduct({ id: 'p1', categoryId: 'cat-necklace', name: 'Kundan Necklace' }),
        makeProduct({ id: 'p2', categoryId: 'cat-ring', name: 'Kundan Ring' }),
      ],
    })

    store.setFilters({ categoryId: 'cat-necklace', searchTerm: 'kundan' })

    expect(store.filteredProducts.map((p) => p.id)).toEqual(['p1'])
  })

  it('returns an empty array when nothing matches (no products found edge case)', () => {
    const store = useCatalogueStore()
    store.$patch({ products: [makeProduct({ id: 'p1' })] })

    store.setFilters({ searchTerm: 'nonexistent-keyword' })

    expect(store.filteredProducts).toEqual([])
  })

  it('clearFilters resets back to the unfiltered product list', () => {
    const store = useCatalogueStore()
    store.$patch({ products: [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2', categoryId: 'cat-ring' })] })
    store.setFilters({ categoryId: 'cat-ring' })
    expect(store.filteredProducts).toHaveLength(1)

    store.clearFilters()

    expect(store.filteredProducts).toHaveLength(2)
  })

  it('exposes the taxonomy reference data unmodified', () => {
    const store = useCatalogueStore()
    store.$patch({ categories: [category], collections: [collection], styleTags: [styleTag] })

    expect(store.categories).toEqual([category])
    expect(store.collections).toEqual([collection])
    expect(store.styleTags).toEqual([styleTag])
  })
})
