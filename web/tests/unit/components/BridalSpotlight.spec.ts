import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const BridalSpotlight = (await import('../../../src/components/public/BridalSpotlight.vue')).default

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
    isBridal: true,
    styleGroup: null,
    createdAt: 0,
    updatedAt: 0,
    createdBy: 'uid1',
    updatedBy: 'uid1',
    ...overrides,
  }
}

describe('BridalSpotlight', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
    localStorage.clear()
  })

  it('renders only bridal products', () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [
        makeProduct({ id: 'p1', isBridal: true }),
        makeProduct({ id: 'p2', isBridal: false }),
      ],
    })

    const wrapper = mount(BridalSpotlight, { props: { businessPhoneE164: '919999999999' } })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(1)
  })

  it('renders nothing when there are no bridal products', () => {
    const store = useCatalogueStore()
    store.$patch({ products: [makeProduct({ isBridal: false })] })

    const wrapper = mount(BridalSpotlight, { props: { businessPhoneE164: '919999999999' } })

    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('clicking the bridal CTA filters the catalogue to bridal products', async () => {
    const store = useCatalogueStore()
    store.$patch({ products: [makeProduct({ isBridal: true })] })
    const wrapper = mount(BridalSpotlight, { props: { businessPhoneE164: '919999999999' } })

    await wrapper.get('[data-testid="bridal-cta"]').trigger('click')

    expect(store.filters.isBridal).toBe(true)
  })
})
