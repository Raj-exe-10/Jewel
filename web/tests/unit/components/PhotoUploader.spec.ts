import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn(),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
}))

vi.mock('../../../src/composables/useImageCompression', () => ({
  useImageCompression: () => ({
    compress: vi.fn(async (file: File) => file),
  }),
}))

const PhotoUploader = (await import('../../../src/components/admin/PhotoUploader.vue')).default

describe('PhotoUploader', () => {
  it('shows an attachment button and keeps a hidden file input for tests', () => {
    const wrapper = mount(PhotoUploader, {
      props: { modelValue: [] },
    })

    expect(wrapper.find('[data-testid="photo-attach-button"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="photo-attach-button"]').text()).toMatch(/add photos/i)
    expect(wrapper.find('[data-testid="photo-input"]').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/no file chosen/i)
  })

  it('labels the button as add more when attachments already exist and never shows no-file-chosen', () => {
    const wrapper = mount(PhotoUploader, {
      props: { modelValue: ['https://example.com/a.jpg'] },
    })

    expect(wrapper.get('[data-testid="photo-attach-button"]').text()).toMatch(/add more/i)
    expect(wrapper.text()).not.toMatch(/no file chosen/i)
    expect(wrapper.find('img[alt="Product photo"]').exists()).toBe(true)
  })
})
