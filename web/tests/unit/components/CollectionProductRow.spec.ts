import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))
vi.mock('../../../src/composables/useCarousel', () => ({
  useCarousel: () => ({ emblaRef: { value: null }, scrollPrev: vi.fn(), scrollNext: vi.fn() }),
}))

const CollectionProductRow = (
  await import('../../../src/components/public/CollectionProductRow.vue')
).default

function makeProduct(id: string): Product {
  return {
    id,
    name: `Product ${id}`,
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
  }
}

describe('CollectionProductRow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders each product once when the row has fewer than six products', () => {
    const wrapper = mount(CollectionProductRow, {
      props: {
        products: [makeProduct('p1'), makeProduct('p2')],
        businessPhoneE164: '919999999999',
        categoryNameFor: () => 'Necklace',
      },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: "<a :href=\"typeof to === 'string' ? to : '#'\"><slot /></a>",
          },
        },
      },
    })

    expect(wrapper.findAll('[data-testid="product-card"]')).toHaveLength(2)
  })
})
