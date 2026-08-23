import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../src/types/catalogue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: {} }),
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>',
  },
}))
vi.mock('../../../src/firebase/config', () => ({ db: {}, auth: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
}))

const CollectionPage = (await import('../../../src/views/CollectionPage.vue')).default
const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useBusinessStore } = await import('../../../src/stores/business')
const { useWishlistStore } = await import('../../../src/stores/wishlist')

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Kundan Choker',
    priceInr: 5000,
    description: 'A lovely necklace',
    photoUrls: ['https://example.com/a.jpg'],
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
    createdBy: 'u',
    updatedBy: 'u',
    ...overrides,
  }
}

describe('CollectionPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const catalogue = useCatalogueStore()
    catalogue.$patch({
      products: [makeProduct()],
      categories: [{ id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }],
      styleTags: [{ id: 'style-antique', name: 'Antique', sortOrder: 0, createdAt: 0 }],
    })
    catalogue.subscribeToCatalogue = vi.fn()
    const business = useBusinessStore()
    business.$patch({
      profile: {
        whatsappNumberE164: '919999999999',
        instagramHandle: 'amore.jewelry',
        address: '',
        mapUrl: '',
      },
      loaded: true,
    })
    business.subscribeToProfile = vi.fn()
    useWishlistStore().load = vi.fn()
  })

  it('renders filters and product cards', () => {
    const wrapper = mount(CollectionPage, {
      global: {
        stubs: {
          Header: true,
          Footer: true,
          FloatingWhatsAppButton: true,
          RouterLink: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="collection-page"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="collection-filters"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="collection-carousel"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="product-card"]').length).toBeGreaterThan(0)
    expect(wrapper.get('[data-testid="style-chip-style-antique"]').exists()).toBe(true)
  })
})
