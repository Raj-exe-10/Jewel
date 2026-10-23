import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const uploadPublicFile = vi.fn().mockResolvedValue('https://example.com/file')

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile,
  deletePublicUrl: vi.fn().mockResolvedValue(undefined),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
}))

vi.mock('../../../src/composables/useImageCompression', () => ({
  useImageCompression: () => ({ compress: vi.fn(async (file: File) => file) }),
}))

const ProductMediaUploader = (await import('../../../src/components/admin/ProductMediaUploader.vue'))
  .default

async function selectFiles(wrapper: ReturnType<typeof mount>, testId: string, files: File[]) {
  const input = wrapper.get(`[data-testid="${testId}"]`)
  Object.defineProperty(input.element, 'files', { value: files, configurable: true })
  await input.trigger('change')
  await wrapper.vm.$nextTick()
}

describe('ProductMediaUploader negatives (UI-NEG-03/04)', () => {
  beforeEach(() => {
    uploadPublicFile.mockReset()
    uploadPublicFile.mockResolvedValue('https://example.com/file')
  })

  it('declares image/* and video MIME accept hints', () => {
    const wrapper = mount(ProductMediaUploader, {
      props: { modelValue: [], productId: 'p1' },
    })
    expect(wrapper.get('[data-testid="media-image-input"]').attributes('accept')).toBe('image/*')
    expect(wrapper.get('[data-testid="media-video-input"]').attributes('accept')).toMatch(/video/)
  })

  it('UI-NEG-03: rejected image MIME shows media-upload-error and does not upload', async () => {
    const wrapper = mount(ProductMediaUploader, {
      props: { modelValue: [], productId: 'p1' },
    })
    const bad = new File(['not-image'], 'notes.txt', { type: 'text/plain' })
    await selectFiles(wrapper, 'media-image-input', [bad])

    expect(uploadPublicFile).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="media-upload-error"]').text()).toMatch(/image/i)
  })

  it('UI-NEG-04: network abort on upload shows friendly error banner', async () => {
    uploadPublicFile.mockRejectedValue(new Error('Failed to fetch'))
    const wrapper = mount(ProductMediaUploader, {
      props: { modelValue: [], productId: 'p1' },
    })
    const good = new File(['img'], 'a.jpg', { type: 'image/jpeg' })
    await selectFiles(wrapper, 'media-image-input', [good])
    await vi.waitFor(() => {
      expect(wrapper.find('[data-testid="media-upload-error"]').exists()).toBe(true)
    })
    expect(wrapper.get('[data-testid="media-upload-error"]').text()).toMatch(/upload|try again/i)
  })
})
