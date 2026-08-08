import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category, Collection } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const HeroVisuals = (await import('../../../src/components/public/HeroVisuals.vue')).default

const category: Category = { id: 'cat-1', name: 'Necklace', sortOrder: 0, createdAt: 0 }
const collectionItem: Collection = { id: 'col-1', name: 'Jadau Kundan', sortOrder: 0, createdAt: 0 }

describe('HeroVisuals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders the "Shop the Visuals" heading', () => {
    const wrapper = mount(HeroVisuals)
    expect(wrapper.text()).toContain('Shop the Visuals')
  })

  it('renders a tile for every category and collection', () => {
    const store = useCatalogueStore()
    store.$patch({ categories: [category], collections: [collectionItem] })

    const wrapper = mount(HeroVisuals)

    expect(wrapper.findAll('[data-testid="shop-visuals-tile"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Necklace')
    expect(wrapper.text()).toContain('Jadau Kundan')
  })

  it('clicking a category tile filters the catalogue by that category', async () => {
    const store = useCatalogueStore()
    store.$patch({ categories: [category] })
    const wrapper = mount(HeroVisuals)

    await wrapper.get('[data-testid="shop-visuals-tile"]').trigger('click')

    expect(store.filters.categoryId).toBe('cat-1')
  })

  it('shows a placeholder message when there are no categories or collections yet', () => {
    const wrapper = mount(HeroVisuals)
    expect(wrapper.text()).toContain('Categories coming soon.')
  })
})
