import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductCard from '../../../src/components/public/ProductCard.vue'
import type { Product } from '../../../src/types/catalogue'

const memory = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value)
  },
  removeItem: (key: string) => {
    memory.delete(key)
  },
  clear: () => memory.clear(),
})

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
    memory.clear()
    setActivePinia(createPinia())
  })

  function mountCard(responsiveCompact = false, detailOrigin?: 'home' | 'collection') {
    return mount(ProductCard, {
      props: {
        product,
        categoryName: 'Necklace',
        businessPhoneE164: '919999999999',
        responsiveCompact,
        detailOrigin,
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
  }

  it('renders photo, name, category, price, and description', () => {
    const wrapper = mountCard()

    expect(wrapper.find('img').attributes('src')).toBe(product.photoUrls[0])
    expect(wrapper.text()).toContain('Kundan Choker Necklace')
    expect(wrapper.text()).toContain('Necklace')
    expect(wrapper.text()).toContain('5,000')
    expect(wrapper.text()).toContain('A lovely handcrafted necklace')
  })

  it('keeps the full mobile layout, becomes compact on tablet, and restores typography on desktop', () => {
    const wrapper = mountCard(true)

    const imageClasses = wrapper.get('img').classes()
    expect(imageClasses).toContain('aspect-[3/4]')
    expect(imageClasses).toContain('sm:aspect-square')

    const contentClasses = wrapper
      .get('[data-testid="product-detail-link"] > div:last-child')
      .classes()
    expect(contentClasses).toContain('p-4')
    expect(contentClasses).toContain('sm:p-2')

    const enquiryClasses = wrapper.get('[data-testid="whatsapp-link"]').classes()
    expect(enquiryClasses).toContain('px-4')
    expect(enquiryClasses).toContain('sm:px-2')

    expect(
      wrapper.get('[data-testid="product-detail-link"] > div:last-child > p').classes(),
    ).toContain('lg:text-xs')
    expect(wrapper.get('h3').classes()).toContain('lg:text-lg')
    expect(wrapper.find('h3 + p').classes()).toContain('lg:text-sm')
    expect(wrapper.find('h3 + p + p').classes()).toContain('lg:text-base')
    expect(wrapper.get('[data-testid="whatsapp-link"]').classes()).toContain('lg:text-sm')
  })

  it('links the card media to the product detail page', () => {
    const wrapper = mountCard()
    expect(wrapper.get('[data-testid="product-detail-link"]').attributes('href')).toBe(
      '/product/p1',
    )
  })

  it('includes the supplied source page in the product detail link', () => {
    const wrapper = mountCard(false, 'home')

    expect(wrapper.get('[data-testid="product-detail-link"]').attributes('href')).toBe(
      '/product/p1?from=home',
    )
  })

  it('wraps name and description in the same detail link as the media', () => {
    const wrapper = mountCard()
    const link = wrapper.get('[data-testid="product-detail-link"]')
    expect(link.text()).toContain('Kundan Choker Necklace')
    expect(link.text()).toContain('A lovely handcrafted necklace')
    expect(link.find('img').exists()).toBe(true)
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
