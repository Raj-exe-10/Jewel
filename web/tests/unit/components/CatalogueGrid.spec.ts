import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category, Product } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const CatalogueGrid = (await import('../../../src/components/public/CatalogueGrid.vue')).default

const category: Category = { id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Kundan Choker Necklace',
    priceInr: 5000,
    description: 'desc',
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

describe('CatalogueGrid', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders one ProductCard per filtered product', () => {
    const store = useCatalogueStore()
    store.$patch({
      categories: [category],
      products: [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2' })],
    })

    const wrapper = mount(CatalogueGrid, { props: { businessPhoneE164: '919999999999' } })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(2)
  })

  it('shows a friendly empty state when no products match the current filter/search', () => {
    const store = useCatalogueStore()
    store.$patch({ categories: [category], products: [makeProduct({ id: 'p1' })] })
    store.setFilters({ searchTerm: 'nonexistent-keyword' })

    const wrapper = mount(CatalogueGrid, { props: { businessPhoneE164: '919999999999' } })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(0)
    expect(wrapper.get('[data-testid="empty-state"]').text().length).toBeGreaterThan(0)
  })
})
