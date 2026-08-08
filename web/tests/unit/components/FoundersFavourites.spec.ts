import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const FoundersFavourites = (await import('../../../src/components/public/FoundersFavourites.vue')).default

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

describe('FoundersFavourites', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders only products flagged isFounderFavourite', () => {
    const store = useCatalogueStore()
    store.$patch({
      categories: [{ id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }],
      products: [
        makeProduct({ id: 'p1', isFounderFavourite: true }),
        makeProduct({ id: 'p2', isFounderFavourite: false }),
        makeProduct({ id: 'p3', isFounderFavourite: true }),
      ],
    })

    const wrapper = mount(FoundersFavourites, { props: { businessPhoneE164: '919999999999' } })

    const cards = wrapper.findAll('[data-testid="product-card"]')
    expect(cards).toHaveLength(2)
  })

  it('renders nothing when there are no founder favourites', () => {
    const store = useCatalogueStore()
    store.$patch({ products: [makeProduct({ id: 'p1', isFounderFavourite: false })] })

    const wrapper = mount(FoundersFavourites, { props: { businessPhoneE164: '919999999999' } })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(0)
  })
})
