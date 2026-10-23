import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSearchHistory, pushSearchHistory } from '../../../src/lib/searchHistory'
import type { Product } from '../../../src/types/catalogue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ path: '/' }),
}))



const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const SearchBox = (await import('../../../src/components/public/SearchBox.vue')).default

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

function installMemoryLocalStorage() {
  const store = new Map<string, string>()
  const memory: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => [...store.keys()][index] ?? null,
    removeItem: (key) => {
      store.delete(key)
    },
    setItem: (key, value) => {
      store.set(key, String(value))
    },
  }
  vi.stubGlobal('localStorage', memory)
}

describe('SearchBox', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    setActivePinia(createPinia())
    push.mockClear()
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

  it('filters the catalogue live as the user types (without waiting for Enter)', async () => {
    const store = useCatalogueStore()
    const wrapper = mount(SearchBox)

    await wrapper.get('input').trigger('focus')
    await wrapper.get('input').setValue('kundan')
    await wrapper.get('input').trigger('input')

    expect(store.filters.searchTerm).toBe('kundan')
    expect(wrapper.find('[data-testid="search-suggestions"]').exists()).toBe(true)
  })

  it('keeps the term visible and records history on Enter', async () => {
    const store = useCatalogueStore()
    const wrapper = mount(SearchBox)

    const input = wrapper.get('input')
    await input.setValue('kundan')
    await input.trigger('input')
    await input.trigger('keydown.enter')

    expect(store.filters.searchTerm).toBe('kundan')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('kundan')
    expect(push).not.toHaveBeenCalled()
  })

  it('shows recent history when focused with an empty input', async () => {
    pushSearchHistory('polki')
    const wrapper = mount(SearchBox)

    await wrapper.get('input').trigger('focus')

    expect(wrapper.find('[data-testid="search-history"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="search-history-item"]').text()).toContain('polki')
  })

  it('applies a history term on click and keeps it in the input', async () => {
    const store = useCatalogueStore()
    pushSearchHistory('polki')
    const wrapper = mount(SearchBox)

    await wrapper.get('input').trigger('focus')
    await wrapper.get('[data-testid="search-history-item"]').trigger('click')

    expect(store.filters.searchTerm).toBe('polki')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('polki')
  })

  it('removes a history term when the remove button is clicked', async () => {
    pushSearchHistory('polki')
    pushSearchHistory('rings')
    const wrapper = mount(SearchBox)

    await wrapper.get('input').trigger('focus')
    await wrapper.get('[data-testid="search-history-remove"]').trigger('click')

    expect(wrapper.text()).not.toContain('rings')
    expect(wrapper.find('[data-testid="search-history-item"]').text()).toContain('polki')
  })

  it('navigates to product detail when a product suggestion is chosen', async () => {
    const wrapper = mount(SearchBox)

    await wrapper.get('input').trigger('focus')
    await wrapper.get('input').setValue('kun')
    await wrapper.get('input').trigger('input')
    await wrapper.get('[data-testid="search-suggestion-product-p1"]').trigger('click')

    expect(push).toHaveBeenCalledWith({ name: 'product-detail', params: { id: 'p1' } })
  })

  it('applies a category suggestion as a chip filter without AND-ing the label as search text', async () => {
    const store = useCatalogueStore()
    document.body.innerHTML = '<div id="collection-products"></div>'
    document.getElementById('collection-products')!.scrollIntoView = vi.fn()

    const wrapper = mount(SearchBox)
    await wrapper.get('input').trigger('focus')
    await wrapper.get('input').setValue('neck')
    await wrapper.get('input').trigger('input')
    await wrapper.get('[data-testid="search-suggestion-category-cat-1"]').trigger('click')

    expect(store.filters.categoryId).toBe('cat-1')
    expect(store.filters.searchTerm).toBe('')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
    expect(wrapper.find('[data-testid="search-suggestions"]').exists()).toBe(false)
  })

  it('keeps an active category chip when the user searches by keyword', async () => {
    const store = useCatalogueStore()
    store.$patch({ filters: { ...store.filters, categoryId: 'cat-1' } })

    const wrapper = mount(SearchBox)
    const input = wrapper.get('input')
    await input.setValue('kundan')
    await input.trigger('input')
    await input.trigger('keydown.enter')

    expect(store.filters.searchTerm).toBe('kundan')
    expect(store.filters.categoryId).toBe('cat-1')
  })
})
