import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn().mockResolvedValue(undefined) }),
  useRoute: () => ({ path: '/', name: 'public-home', hash: '' }),
}))

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

import type { Product, StyleTag } from '../../../src/types/catalogue'

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const ShopTheStyle = (await import('../../../src/components/public/ShopTheStyle.vue')).default

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

const festiveTag: StyleTag = { id: 'tag-festive', name: 'Festive', sortOrder: 0, createdAt: 0 }
const bridalTag: StyleTag = { id: 'tag-bridal', name: 'Bridal', sortOrder: 1, createdAt: 0 }

describe('ShopTheStyle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders a card for each style tag', () => {
    const store = useCatalogueStore()
    store.$patch({
      styleTags: [festiveTag, bridalTag],
      products: [makeProduct({ styleTagIds: ['tag-festive'] })],
    })

    const wrapper = mount(ShopTheStyle)

    const cards = wrapper.findAll('[data-testid="style-tag-card"]')
    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('Festive')
    expect(wrapper.text()).toContain('Bridal')
  })

  it('clicking a style card filters the catalogue by that style tag', async () => {
    const store = useCatalogueStore()
    store.$patch({ styleTags: [festiveTag] })
    const wrapper = mount(ShopTheStyle)

    await wrapper.get('[data-testid="style-tag-card"]').trigger('click')

    expect(store.filters.styleTagId).toBe('tag-festive')
  })

  it('renders nothing when there are no style tags', () => {
    const wrapper = mount(ShopTheStyle)
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
