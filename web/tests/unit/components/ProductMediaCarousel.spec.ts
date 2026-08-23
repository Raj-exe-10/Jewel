import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { ProductMediaItem } from '../../../src/lib/productMedia'

vi.mock('embla-carousel', () => {
  const api = {
    on: vi.fn(),
    destroy: vi.fn(),
    reInit: vi.fn(),
    canScrollPrev: () => true,
    canScrollNext: () => true,
    selectedScrollSnap: () => 0,
    scrollSnapList: () => [0, 1],
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    scrollTo: vi.fn(),
  }
  return { default: vi.fn(() => api) }
})
vi.mock('embla-carousel-autoplay', () => ({
  default: vi.fn(() => ({ name: 'autoplay' })),
}))

const ProductMediaCarousel = (await import('../../../src/components/public/ProductMediaCarousel.vue')).default

const media: ProductMediaItem[] = [
  { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
  { id: 'v1', kind: 'video', url: 'https://example.com/a.mp4', posterUrl: '', sortOrder: 1 },
]

describe('ProductMediaCarousel', () => {
  it('renders mixed media slides with prev/next controls and thumbnails', () => {
    const wrapper = mount(ProductMediaCarousel, {
      props: { media, productName: 'Kundan Choker' },
    })

    expect(wrapper.get('[data-testid="product-media-carousel"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="product-media-item"]')).toHaveLength(2)
    expect(wrapper.find('video').exists()).toBe(true)
    expect(wrapper.get('[data-testid="product-media-prev"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="product-media-next"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="product-media-thumb"]')).toHaveLength(2)
  })
})
