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

import FilterChips from '../../../src/components/public/FilterChips.vue'
import SearchBox from '../../../src/components/public/SearchBox.vue'
import type { Category } from '../../../src/types/catalogue'

const { useCatalogueStore } = await import('../../../src/stores/catalogue')

const categories: Category[] = [
  { id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 },
  { id: 'cat-ring', name: 'Rings', sortOrder: 1, createdAt: 0 },
]

describe('FilterChips', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('narrows the catalogue store filter when a chip is clicked', async () => {
    const store = useCatalogueStore()
    store.$patch({ categories })

    const wrapper = mount(FilterChips)
    await wrapper.get('[data-testid="filter-chip-cat-ring"]').trigger('click')

    expect(store.filters.categoryId).toBe('cat-ring')
  })

  it('clicking the active chip again clears the category filter', async () => {
    const store = useCatalogueStore()
    store.$patch({ categories })
    store.setFilters({ categoryId: 'cat-ring' })

    const wrapper = mount(FilterChips)
    await wrapper.get('[data-testid="filter-chip-cat-ring"]').trigger('click')

    expect(store.filters.categoryId).toBeNull()
  })
})

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/', name: 'public-home', hash: '' }),
}))

vi.mock('../../../src/composables/useCatalogueNav', () => ({
  useCatalogueNav: () => ({
    scrollToCollectionProducts: vi.fn(),
  }),
}))

describe('SearchBox', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('submitting a search updates the catalogue store search term', async () => {
    const store = useCatalogueStore()
    const wrapper = mount(SearchBox)

    const input = wrapper.get('input')
    await input.setValue('kundan')
    await input.trigger('keydown.enter')

    expect(store.filters.searchTerm).toBe('kundan')
  })
})


