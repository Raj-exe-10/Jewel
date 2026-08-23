import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const CollectionFilters = (await import('../../../src/components/public/CollectionFilters.vue')).default

describe('CollectionFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useCatalogueStore().$patch({
      categories: [
        { id: 'cat-1', name: 'Necklaces', sortOrder: 0, createdAt: 0 },
        { id: 'cat-bangles', name: 'Bangles', sortOrder: 1, createdAt: 0 },
        { id: 'cat-rings', name: 'Rings', sortOrder: 2, createdAt: 0 },
      ],
      collections: [{ id: 'col-1', name: 'Jadau Kundan', sortOrder: 0, createdAt: 0 }],
      styleTags: [{ id: 'tag-1', name: 'Festive', sortOrder: 0, createdAt: 0 }],
      filters: {
        categoryId: null,
        collectionId: null,
        styleTagId: null,
        isBridal: null,
        searchTerm: '',
      },
    })
  })

  it('highlights a category chip when searchTerm matches its name', () => {
    useCatalogueStore().$patch({ filters: { searchTerm: 'Necklace' } })
    const wrapper = mount(CollectionFilters)
    const chip = wrapper.get('[data-testid="filter-chip-cat-1"]')
    expect(chip.attributes('aria-pressed')).toBe('true')
    expect(chip.classes().join(' ')).toMatch(/amore-gold/)
  })

  it('does not highlight chips when searchTerm is empty', () => {
    const wrapper = mount(CollectionFilters)
    expect(wrapper.get('[data-testid="filter-chip-cat-1"]').attributes('aria-pressed')).toBe('false')
  })

  it('selecting a category chip replaces prior search and highlights only that chip', async () => {
    const store = useCatalogueStore()
    store.$patch({ filters: { ...store.filters, searchTerm: 'ring' } })
    const wrapper = mount(CollectionFilters)

    expect(wrapper.get('[data-testid="filter-chip-cat-rings"]').attributes('aria-pressed')).toBe('true')

    await wrapper.get('[data-testid="filter-chip-cat-bangles"]').trigger('click')

    expect(store.filters.searchTerm).toBe('')
    expect(store.filters.categoryId).toBe('cat-bangles')
    expect(wrapper.get('[data-testid="filter-chip-cat-bangles"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="filter-chip-cat-rings"]').attributes('aria-pressed')).toBe('false')
  })
})
