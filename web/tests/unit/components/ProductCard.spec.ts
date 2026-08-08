import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ProductCard from '../../../src/components/public/ProductCard.vue'
import type { Product } from '../../../src/types/catalogue'

const product: Product = {
  id: 'p1',
  name: 'Kundan Choker Necklace',
  priceInr: 5000,
  description: 'A lovely handcrafted necklace',
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

describe('ProductCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function mountCard() {
    return mount(ProductCard, {
      props: {
        product,
        categoryName: 'Necklace',
        businessPhoneE164: '919999999999',
      },
    })
  }

  it('renders photo, name, category, price, and description', () => {
    const wrapper = mountCard()

    expect(wrapper.find('img').attributes('src')).toBe(product.photoUrls[0])
    expect(wrapper.text()).toContain('Kundan Choker Necklace')
    expect(wrapper.text()).toContain('Necklace')
    expect(wrapper.text()).toContain('5,000')
    expect(wrapper.text()).toContain('A lovely handcrafted necklace')
  })

  it('the enquire link href includes the product name', () => {
    const wrapper = mountCard()
    const link = wrapper.get('[data-testid="whatsapp-link"]')

    expect(decodeURIComponent(link.attributes('href') ?? '')).toContain(product.name)
  })

  it('toggles the wishlist heart when clicked', async () => {
    const wrapper = mountCard()
    const heart = wrapper.get('[data-testid="wishlist-toggle"]')

    expect(heart.attributes('aria-pressed')).toBe('false')
    await heart.trigger('click')
    expect(heart.attributes('aria-pressed')).toBe('true')
    await heart.trigger('click')
    expect(heart.attributes('aria-pressed')).toBe('false')
  })
})
