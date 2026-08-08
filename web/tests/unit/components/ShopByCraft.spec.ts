import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Collection } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

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
