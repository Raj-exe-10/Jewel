import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn().mockResolvedValue(undefined),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
  splitFolder: vi.fn((folder) => {
    const parts = String(folder).split('/').filter(Boolean)
    return { bucket: parts[0] ?? 'product-photos', prefix: parts.slice(1).join('/') }
  }),
  publicObjectUrl: vi.fn(() => 'https://example.com/file'),
  parsePublicUrl: vi.fn(),
}))

import type { Product } from '../../../src/types/catalogue'

const { routeState, backMock, pushMock } = vi.hoisted(() => ({
  routeState: {
    params: { id: 'p1' },
    query: {} as Record<string, string>,
  },
  backMock: vi.fn(),
  pushMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: pushMock, back: backMock }),
  RouterLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>',
  },
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
    routeState.params = { id: 'p1' }
    routeState.query = {}
    backMock.mockReset()
    pushMock.mockReset()
    // Simulate a deep-link open (no prior SPA history entry).
    vi.stubGlobal('history', { ...window.history, state: { back: null, current: '/', forward: null } })
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

  it('falls back to collection when Back is used without prior history', async () => {
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

    const back = wrapper.get('[data-testid="product-back-link"]')
    expect(back.text()).toMatch(/Back/i)
    await back.trigger('click')
    expect(backMock).not.toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/collection')
  })

  it('falls back to home when opened from home without prior history', async () => {
    routeState.query = { from: 'home' }
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

    await wrapper.get('[data-testid="product-back-link"]').trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('UI-NEG-07: shows unavailable state for a missing product id', () => {
    routeState.params = { id: 'not-a-real-id' }
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
    expect(wrapper.find('[data-testid="product-detail"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="product-unavailable"]').text()).toMatch(/no longer available/i)
  })

  it('uses router.back when SPA history exists so browser Back stays coherent', async () => {
    vi.stubGlobal('history', {
      ...window.history,
      state: { back: '/', current: '/product/p1', forward: null, position: 1 },
    })
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

    await wrapper.get('[data-testid="product-back-link"]').trigger('click')
    expect(backMock).toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })
})
