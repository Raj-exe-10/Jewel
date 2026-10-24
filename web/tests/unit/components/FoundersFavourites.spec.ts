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

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const FoundersFavourites = (await import('../../../src/components/public/FoundersFavourites.vue'))
  .default

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

    const wrapper = mount(FoundersFavourites, {
      props: { businessPhoneE164: '919999999999' },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: "<a :href=\"typeof to === 'string' ? to : '#'\"><slot /></a>",
          },
        },
      },
    })

    const cards = wrapper.findAll('[data-testid="product-card"]')
    // Two favourites are duplicated (<6) so Embla can loop.
    expect(cards).toHaveLength(4)
    expect(wrapper.find('#founders-favourites-products').exists()).toBe(true)
    expect(cards[0].find('img').classes()).toContain('sm:aspect-square')
    expect(cards[0].element.parentElement?.classList.contains('lg:flex-[0_0_48%]')).toBe(true)
    expect(cards[0].get('[data-testid="product-detail-link"]').attributes('href')).toBe(
      '/product/p1?from=home',
    )
  })

  it('renders nothing when there are no founder favourites', () => {
    const store = useCatalogueStore()
    store.$patch({ products: [makeProduct({ id: 'p1', isFounderFavourite: false })] })

    const wrapper = mount(FoundersFavourites, { props: { businessPhoneE164: '919999999999' } })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(0)
  })
})
