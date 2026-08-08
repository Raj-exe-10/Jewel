import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FilterChips from '../../../src/components/public/FilterChips.vue'
import SearchBox from '../../../src/components/public/SearchBox.vue'
import type { Category } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

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

describe('SearchBox', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('typing updates the catalogue store search term', async () => {
    const store = useCatalogueStore()
    const wrapper = mount(SearchBox)

    await wrapper.get('input').setValue('kundan')

    expect(store.filters.searchTerm).toBe('kundan')
  })
})
