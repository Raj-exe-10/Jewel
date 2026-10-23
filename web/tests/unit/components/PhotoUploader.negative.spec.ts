import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const uploadPublicFile = vi.fn().mockResolvedValue('https://example.com/file')

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile,
  deletePublicUrl: vi.fn(),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
}))

vi.mock('../../../src/composables/useImageCompression', () => ({
  useImageCompression: () => ({
    compress: vi.fn(async (file: File) => file),
  }),
}))

const PhotoUploader = (await import('../../../src/components/admin/PhotoUploader.vue')).default

describe('PhotoUploader negatives', () => {
  beforeEach(() => {
    uploadPublicFile.mockReset()
    uploadPublicFile.mockResolvedValue('https://example.com/file')
  })

  it('rejects non-image MIME without calling storage', async () => {
    const wrapper = mount(PhotoUploader, { props: { modelValue: [] } })
    const input = wrapper.get('[data-testid="photo-input"]').element as HTMLInputElement
    const bad = new File(['x'], 'x.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [bad], configurable: true })
    await wrapper.get('[data-testid="photo-input"]').trigger('change')
    await wrapper.vm.$nextTick()
    expect(uploadPublicFile).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="upload-error"]').text()).toMatch(/image/i)
  })

  it('shows upload-error when storage upload fails', async () => {
    uploadPublicFile.mockRejectedValue(new Error('network'))
    const wrapper = mount(PhotoUploader, { props: { modelValue: [] } })
    const input = wrapper.get('[data-testid="photo-input"]').element as HTMLInputElement
    const good = new File(['x'], 'a.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input, 'files', { value: [good], configurable: true })
    await wrapper.get('[data-testid="photo-input"]').trigger('change')
    await vi.waitFor(() => {
      expect(wrapper.find('[data-testid="upload-error"]').exists()).toBe(true)
    })
    expect(wrapper.get('[data-testid="upload-error"]').text()).toMatch(/connection|try again/i)
  })
})
