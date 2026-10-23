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

import { clearSearchHistory, pushSearchHistory } from '../../../src/lib/searchHistory'
import type { Product } from '../../../src/types/catalogue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ path: '/' }),
}))
const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const SearchOverlay = (await import('../../../src/components/public/SearchOverlay.vue')).default

const product: Product = {
  id: 'p1',
  name: 'Kundan Choker',
  priceInr: 5000,
  description: 'Handcrafted',
  photoUrls: [],
  categoryId: 'cat-1',
  styleTagIds: [],
  collectionId: null,
  isNewArrival: false,
  isFounderFavourite: false,
  isStatementPick: false,
  isBridal: false,
  styleGroup: null,
  createdAt: 0,
  updatedAt: 0,
  createdBy: 'u1',
  updatedBy: 'u1',
}

describe('SearchOverlay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockClear()
    localStorage.clear()
    clearSearchHistory()

    useCatalogueStore().$patch({
      products: [product],
      categories: [{ id: 'cat-1', name: 'Necklaces', sortOrder: 0, createdAt: 0 }],
      collections: [],
      styleTags: [],
      filters: {
        categoryId: null,
        collectionId: null,
        styleTagId: null,
        isBridal: null,
        searchTerm: '',
      },
    })
  })

  it('renders nothing when closed', () => {
    const wrapper = mount(SearchOverlay, { props: { open: false } })
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(false)
  })

  it('renders the search input when open and emits close on the close button', async () => {
    const wrapper = mount(SearchOverlay, { props: { open: true } })
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(true)

    await wrapper.get('[data-testid="search-overlay-close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('keeps typing local without updating filters or navigating', async () => {
    const store = useCatalogueStore()
    const wrapper = mount(SearchOverlay, { props: { open: true } })

    await wrapper.get('input').setValue('kundan')
    await wrapper.get('input').trigger('input')

    expect(store.filters.searchTerm).toBe('')
    expect(push).not.toHaveBeenCalled()
  })

  it('shows suggestions for matching products and categories', async () => {
    const wrapper = mount(SearchOverlay, { props: { open: true } })

    await wrapper.get('input').setValue('kun')
    await wrapper.get('input').trigger('input')

    expect(wrapper.find('[data-testid="search-suggestions"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="search-suggestion-product-p1"]').exists()).toBe(true)

    await wrapper.get('input').setValue('neck')
    await wrapper.get('input').trigger('input')

    expect(wrapper.find('[data-testid="search-suggestion-category-cat-1"]').exists()).toBe(true)
  })

  it('commits searchTerm, navigates, clears the input, and saves history on Enter', async () => {
    const store = useCatalogueStore()
    const wrapper = mount(SearchOverlay, { props: { open: true } })

    const input = wrapper.get('input')
    await input.setValue('kundan')
    await input.trigger('input')
    await input.trigger('keydown.enter')

    expect(store.filters.searchTerm).toBe('kundan')
    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
    expect(wrapper.emitted('close')).toBeTruthy()
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
  })

  it('shows recent history when reopened with an empty input', async () => {
    pushSearchHistory('kundan')
    const wrapper = mount(SearchOverlay, { props: { open: false } })
    await wrapper.setProps({ open: true })

    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
    expect(wrapper.find('[data-testid="search-history"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="search-history-item"]').text()).toContain('kundan')
  })

  it('removes a history term when the remove button is clicked', async () => {
    pushSearchHistory('kundan')
    pushSearchHistory('rings')
    const wrapper = mount(SearchOverlay, { props: { open: true } })

    await wrapper.get('[data-testid="search-history-remove"]').trigger('click')

    expect(wrapper.text()).not.toContain('rings')
    expect(wrapper.find('[data-testid="search-history-item"]').text()).toContain('kundan')
  })

  it('navigates to product detail when a product suggestion is chosen', async () => {
    const wrapper = mount(SearchOverlay, { props: { open: true } })

    await wrapper.get('input').setValue('kun')
    await wrapper.get('input').trigger('input')
    await wrapper.get('[data-testid="search-suggestion-product-p1"]').trigger('click')

    expect(push).toHaveBeenCalledWith({ name: 'product-detail', params: { id: 'p1' } })
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
