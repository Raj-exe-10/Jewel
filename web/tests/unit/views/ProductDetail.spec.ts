import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../src/types/catalogue'

const routeState = vi.hoisted(() => ({
  params: { id: 'p1' },
  query: {} as Record<string, string>,
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
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

const ProductDetail = (await import('../../../src/views/ProductDetail.vue')).default
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
    media: [
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
      { id: 'v1', kind: 'video', url: 'https://example.com/a.mp4', sortOrder: 1 },
    ],
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

describe('ProductDetail', () => {
  beforeEach(() => {
    routeState.query = {}
    setActivePinia(createPinia())
    const catalogue = useCatalogueStore()
    catalogue.$patch({
      products: [makeProduct()],
      categories: [{ id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }],
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

  it('renders the product gallery with image and video media', () => {
    const wrapper = mount(ProductDetail, {
      global: {
        stubs: {
          Header: true,
          Footer: true,
          FloatingWhatsAppButton: true,
          WhatsAppIcon: true,
          SimilarProductsCarousel: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="product-detail"]').text()).toContain('Kundan Choker')
    expect(wrapper.get('[data-testid="product-media-carousel"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="product-media-item"]')).toHaveLength(2)
    expect(wrapper.find('[data-testid="product-media-prev"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="product-media-next"]').exists()).toBe(true)
    expect(wrapper.find('video').exists()).toBe(true)
  })

  it('links back to the collection page with Back label', () => {
    const wrapper = mount(ProductDetail, {
      global: {
        stubs: {
          Header: true,
          Footer: true,
          FloatingWhatsAppButton: true,
          WhatsAppIcon: true,
          SimilarProductsCarousel: true,
          RouterLink: {
            props: ['to'],
            template:
              '<a :href="typeof to === \'string\' ? to : \'#\'" data-testid="product-back-link"><slot /></a>',
          },
        },
      },
    })

    const back = wrapper.get('[data-testid="product-back-link"]')
    expect(back.attributes('href')).toBe('/collection')
    expect(back.text()).toMatch(/Back/i)
    expect(back.text()).not.toMatch(/collection/i)
  })

  it('links back to the home page when opened from home', () => {
    routeState.query = { from: 'home' }
    const wrapper = mount(ProductDetail, {
      global: {
        stubs: {
          Header: true,
          Footer: true,
          FloatingWhatsAppButton: true,
          WhatsAppIcon: true,
          SimilarProductsCarousel: true,
          RouterLink: {
            props: ['to'],
            template:
              '<a :href="typeof to === \'string\' ? to : \'#\'" data-testid="product-back-link"><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.get('[data-testid="product-back-link"]').attributes('href')).toBe('/')
  })
})
