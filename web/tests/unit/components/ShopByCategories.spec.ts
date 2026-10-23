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

import type { Category } from '../../../src/types/catalogue'

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const ShopByCategories = (await import('../../../src/components/public/ShopByCategories.vue')).default

const categories: Category[] = [
  { id: 'cat-1', name: 'Necklace', sortOrder: 0, createdAt: 0 },
  { id: 'cat-2', name: 'Earring', sortOrder: 1, createdAt: 0 },
]

describe('ShopByCategories', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders a tile per category', () => {
    const store = useCatalogueStore()
    store.$patch({ categories })

    const wrapper = mount(ShopByCategories)

    expect(wrapper.findAll('[data-testid="category-tile"]')).toHaveLength(2)
  })

  it('clicking a category tile filters the catalogue', async () => {
    const store = useCatalogueStore()
    store.$patch({ categories })
    const wrapper = mount(ShopByCategories)

    await wrapper.findAll('[data-testid="category-tile"]')[1]!.trigger('click')

    expect(store.filters.categoryId).toBe('cat-2')
  })

  it('renders nothing when there are no categories', () => {
    const wrapper = mount(ShopByCategories)
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
