import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSectionDraft, DEFAULT_HOMEPAGE_SECTIONS } from '../../../src/data/defaultSections'
import type { HomepageSection } from '../../../src/types/homepage'

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn(),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
}))

const SectionEditor = (await import('../../../src/components/admin/SectionEditor.vue')).default

const stubs = {
  PhotoUploader: { template: '<div data-testid="photo-uploader-stub" />', props: ['modelValue'] },
  VideoUploader: {
    name: 'VideoUploader',
    props: ['modelValue', 'sectionId'],
    emits: ['update:modelValue'],
    template:
      '<button data-testid="video-uploader-stub" type="button" @click="$emit(\'update:modelValue\', [{ id: \'v-new\', label: \'New\', posterUrl: \'\', videoUrl: \'https://x\', sortOrder: 0 }])" />',
  },
  ProductPicker: { template: '<div data-testid="product-picker-stub" />', props: ['modelValue'] },
}

function sectionByType(type: HomepageSection['type']): HomepageSection {
  const found = DEFAULT_HOMEPAGE_SECTIONS.find((s) => s.type === type)
  return structuredClone(found ?? createSectionDraft(type))
}

describe('SectionEditor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it.each(['hero_banner', 'video_carousel', 'instagram_gallery', 'about'] as const)(
    'mounts without throwing for %s',
    (type) => {
      const section = sectionByType(type)
      if (type === 'instagram_gallery') {
        ;(section.content as { tiles?: unknown }).tiles = undefined
      }
      if (type === 'about') {
        ;(section.content as { bodyParagraphs?: unknown }).bodyParagraphs = undefined
      }
      if (type === 'hero_banner') {
        const slides = (section.content as { slides: Array<{ ctaTarget?: unknown }> }).slides
        if (slides[0]) slides[0].ctaTarget = undefined
      }

      expect(() =>
        mount(SectionEditor, {
          props: { section },
          global: { stubs },
        }),
      ).not.toThrow()
    },
  )

  it('shows the video uploader for video_carousel sections', () => {
    const section = sectionByType('video_carousel')
    const wrapper = mount(SectionEditor, {
      props: { section },
      global: { stubs },
    })
    expect(wrapper.find('[data-testid="video-uploader-stub"]').exists()).toBe(true)
  })
})

