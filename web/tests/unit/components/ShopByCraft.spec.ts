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

import type { Collection } from '../../../src/types/catalogue'

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const ShopByCraft = (await import('../../../src/components/public/ShopByCraft.vue')).default

const collections: Collection[] = [
  { id: 'col-1', name: 'Jadau Kundan', sortOrder: 0, createdAt: 0 },
  { id: 'col-2', name: 'Polki Moissanite', sortOrder: 1, createdAt: 0 },
]

describe('ShopByCraft', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders a tile per collection', () => {
    const store = useCatalogueStore()
    store.$patch({ collections })

    const wrapper = mount(ShopByCraft)

    expect(wrapper.findAll('[data-testid="craft-tile"]')).toHaveLength(2)
  })

  it('clicking a craft tile filters the catalogue by collection', async () => {
    const store = useCatalogueStore()
    store.$patch({ collections })
    const wrapper = mount(ShopByCraft)

    await wrapper.findAll('[data-testid="craft-tile"]')[0]!.trigger('click')

    expect(store.filters.collectionId).toBe('col-1')
  })

  it('renders nothing when there are no collections', () => {
    const wrapper = mount(ShopByCraft)
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
