import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const ProductPicker = (await import('../../../src/components/admin/ProductPicker.vue')).default

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

describe('ProductPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits the product id when a checkbox is selected', async () => {
    const store = useCatalogueStore()
    store.$patch({ products: [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2', name: 'Ring' })] })

    const wrapper = mount(ProductPicker, { props: { modelValue: [] } })
    await wrapper.get('[data-testid="pick-product-p1"]').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['p1'])
  })
})
