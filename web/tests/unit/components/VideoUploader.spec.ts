import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { SectionVideo } from '../../../src/types/homepage'

vi.mock('../../../src/firebase/config', () => ({ storage: {} }))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))

const VideoUploader = (await import('../../../src/components/admin/VideoUploader.vue')).default

const videos: SectionVideo[] = [
  { id: 'v1', label: 'Bridal Adornment', posterUrl: '', videoUrl: 'https://example.com/a.mp4', sortOrder: 0 },
]

describe('VideoUploader', () => {
  it('lists existing videos and exposes an upload control', () => {
    const wrapper = mount(VideoUploader, {
      props: { modelValue: videos, sectionId: 'default-visuals' },
      global: { stubs: { PhotoUploader: { template: '<div />' } } },
    })

    expect(wrapper.findAll('[data-testid="video-item"]')).toHaveLength(1)
    expect(wrapper.get('[data-testid="video-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="video-attach-button"]').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/no file chosen/i)
  })

  it('renders video previews with controls and omits empty poster attributes', () => {
    const wrapper = mount(VideoUploader, {
      props: { modelValue: videos, sectionId: 'default-visuals' },
      global: { stubs: { PhotoUploader: { template: '<div data-testid="poster-uploader" />' } } },
    })

    const preview = wrapper.get('[data-testid="video-preview"]')
    expect(preview.attributes('controls')).toBeDefined()
    expect(preview.attributes('playsinline')).toBeDefined()
    expect(preview.attributes('poster')).toBeUndefined()
  })

  it('binds poster only when posterUrl is set and shows a load-error fallback', async () => {
    const withPoster: SectionVideo[] = [
      {
        id: 'v1',
        label: 'Bridal Adornment',
        posterUrl: 'https://example.com/poster.jpg',
        videoUrl: 'https://example.com/a.mp4',
        sortOrder: 0,
      },
    ]
    const wrapper = mount(VideoUploader, {
      props: { modelValue: withPoster, sectionId: 'default-visuals' },
      global: {
        stubs: {
          PhotoUploader: {
            props: ['modelValue', 'folder', 'alt'],
            template: '<div data-testid="poster-uploader">{{ alt }}</div>',
          },
        },
      },
    })

    expect(wrapper.get('[data-testid="video-preview"]').attributes('poster')).toBe(
      'https://example.com/poster.jpg',
    )
    expect(wrapper.get('[data-testid="poster-uploader"]').text()).toContain('Poster image')

    await wrapper.get('[data-testid="video-preview"]').trigger('error')
    expect(wrapper.get('[data-testid="video-load-error"]').text()).toMatch(/couldn.?t load/i)
  })

  it('emits an updated list when a video is removed', async () => {
    const wrapper = mount(VideoUploader, {
      props: { modelValue: videos, sectionId: 'default-visuals' },
      global: { stubs: { PhotoUploader: { template: '<div />' } } },
    })

    await wrapper.get('[data-testid="remove-video"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([])
  })
})
