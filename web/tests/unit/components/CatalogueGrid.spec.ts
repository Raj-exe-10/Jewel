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

import type { Category, Product } from '../../../src/types/catalogue'

const push = vi.fn(() => Promise.resolve())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ path: '/' }),
  RouterLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>',
  },
}))
vi.mock('../../../src/composables/useCarousel', () => ({
  useCarousel: () => ({
    emblaRef: { value: null },
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    selectedIndex: { value: 0 },
  }),
}))

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
    push.mockClear()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('renders at most 8 preview products and a View More link', () => {
    const store = useCatalogueStore()
    store.$patch({
      categories: [category],
      products: Array.from({ length: 10 }, (_, i) =>
        makeProduct({ id: `p${i}`, name: `Product ${i}`, createdAt: i }),
      ),
    })

    const wrapper = mount(CatalogueGrid, {
      props: { businessPhoneE164: '919999999999' },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template:
              '<a :href="typeof to === \'string\' ? to : to?.path ?? \'#\'" v-bind="$attrs"><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(8)
    const firstCard = wrapper.findAll('[data-testid="product-card"]')[0]
    expect(firstCard.find('img').classes()).toContain('sm:aspect-square')
    expect(firstCard.element.parentElement?.classList.contains('lg:flex-[0_0_23%]')).toBe(true)
    expect(firstCard.get('[data-testid="product-detail-link"]').attributes('href')).toBe(
      '/product/p9?from=home',
    )
    const viewMore = wrapper.get('[data-testid="catalogue-view-more"]')
    expect(viewMore.attributes('href')).toBe('/collection')
  })

  it('shows a friendly empty state when there are no products', () => {
    const store = useCatalogueStore()
    store.$patch({ categories: [category], products: [] })

    const wrapper = mount(CatalogueGrid, {
      props: { businessPhoneE164: '919999999999' },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(0)
    expect(wrapper.get('[data-testid="empty-state"]').text().length).toBeGreaterThan(0)
  })

  it('opens the collection page from the section heading', async () => {
    const store = useCatalogueStore()
    store.setFilters({ isBridal: true })
    store.$patch({
      categories: [category],
      products: [makeProduct()],
    })

    const wrapper = mount(CatalogueGrid, {
      props: { businessPhoneE164: '919999999999' },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })

    await wrapper.get('[data-testid="catalogue-heading-link"]').trigger('click')
    await Promise.resolve()
    await Promise.resolve()

    expect(store.filters.isBridal).toBeNull()
    expect(push).toHaveBeenCalledWith({ name: 'collection' })
  })
})
