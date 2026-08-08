import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

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
