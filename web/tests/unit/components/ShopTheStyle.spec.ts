import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product, StyleTag } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const ShopTheStyle = (await import('../../../src/components/public/ShopTheStyle.vue')).default

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Kundan Choker Necklace',
    priceInr: 5000,
    description: 'desc',
    photoUrls: ['https://example.com/photo.jpg'],
    categoryId: 'cat-necklace',
    styleTagIds: [],
    collectionId: null,
    isNewArrival: false,
    isFounderFavourite: false,
    isStatementPick: false,
    isBridal: false,
    styleGroup: null,
    createdAt: 0,
    updatedAt: 0,
    createdBy: 'uid1',
    updatedBy: 'uid1',
    ...overrides,
  }
}

const festiveTag: StyleTag = { id: 'tag-festive', name: 'Festive', sortOrder: 0, createdAt: 0 }
const bridalTag: StyleTag = { id: 'tag-bridal', name: 'Bridal', sortOrder: 1, createdAt: 0 }

describe('ShopTheStyle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders a card for each style tag', () => {
    const store = useCatalogueStore()
    store.$patch({
      styleTags: [festiveTag, bridalTag],
      products: [makeProduct({ styleTagIds: ['tag-festive'] })],
    })

    const wrapper = mount(ShopTheStyle)

    const cards = wrapper.findAll('[data-testid="style-tag-card"]')
    expect(cards).toHaveLength(2)
    expect(wrapper.text()).toContain('Festive')
    expect(wrapper.text()).toContain('Bridal')
  })

  it('clicking a style card filters the catalogue by that style tag', async () => {
    const store = useCatalogueStore()
    store.$patch({ styleTags: [festiveTag] })
    const wrapper = mount(ShopTheStyle)

    await wrapper.get('[data-testid="style-tag-card"]').trigger('click')

    expect(store.filters.styleTagId).toBe('tag-festive')
  })

  it('renders nothing when there are no style tags', () => {
    const wrapper = mount(ShopTheStyle)
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
