import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn().mockResolvedValue(undefined),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
  splitFolder: vi.fn((folder) => {
    const parts = String(folder).split('/').filter(Boolean)
    return { bucket: parts[0] ?? 'product-photos', prefix: parts.slice(1).join('/') }
  }),
  publicObjectUrl: vi.fn(() => 'https://example.com/file'),
  parsePublicUrl: vi.fn(),
}))

import type { ProductMediaItem } from '../../../src/lib/productMedia'

const { autoplayMock } = vi.hoisted(() => ({ autoplayMock: vi.fn(() => ({ name: 'autoplay' })) }))

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
  default: autoplayMock,
}))

const ProductMediaCarousel = (
  await import('../../../src/components/public/ProductMediaCarousel.vue')
).default

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
    expect(autoplayMock).not.toHaveBeenCalled()
  })
})
