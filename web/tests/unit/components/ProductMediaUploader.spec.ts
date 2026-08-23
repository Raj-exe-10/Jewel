import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { ProductMediaItem } from '../../../src/lib/productMedia'

vi.mock('../../../src/firebase/config', () => ({ storage: {} }))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))
vi.mock('../../../src/composables/useImageCompression', () => ({
  useImageCompression: () => ({ compress: vi.fn(async (file: File) => file) }),
}))

const ProductMediaUploader = (await import('../../../src/components/admin/ProductMediaUploader.vue')).default

const media: ProductMediaItem[] = [
  { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
  { id: 'v1', kind: 'video', url: 'https://example.com/a.mp4', posterUrl: '', sortOrder: 1 },
]

describe('ProductMediaUploader', () => {
  it('lists mixed image and video items with attach controls', () => {
    const wrapper = mount(ProductMediaUploader, {
      props: { modelValue: media, productId: 'p1' },
    })

    expect(wrapper.findAll('[data-testid="media-item"]')).toHaveLength(2)
    expect(wrapper.find('[data-testid="media-image-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="media-video-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-images-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-videos-button"]').exists()).toBe(true)
  })

  it('emits an updated list when an item is removed', async () => {
    const wrapper = mount(ProductMediaUploader, {
      props: { modelValue: media, productId: 'p1' },
    })

    await wrapper.findAll('[data-testid="remove-media"]')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([{ ...media[1], sortOrder: 0 }])
  })
})
