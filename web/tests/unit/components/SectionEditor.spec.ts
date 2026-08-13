import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_HOMEPAGE_SECTIONS } from '../../../src/data/defaultSections'
import type { HomepageSection, SectionVideo, VideoCarouselContent } from '../../../src/types/homepage'

vi.mock('../../../src/firebase/config', () => ({ db: {}, storage: {}, auth: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))

const SectionEditor = (await import('../../../src/components/admin/SectionEditor.vue')).default

const stubs = {
  PhotoUploader: { template: '<div data-testid="photo-uploader-stub" />', props: ['modelValue'] },
  VideoUploader: {
    name: 'VideoUploader',
    props: ['modelValue', 'sectionId'],
    emits: ['update:modelValue'],
    template: '<button data-testid="video-uploader-stub" type="button" @click="$emit(\'update:modelValue\', [{ id: \'v-new\', label: \'New\', posterUrl: \'\', videoUrl: \'https://x\', sortOrder: 0 }])" />',
  },
  ProductPicker: { template: '<div data-testid="product-picker-stub" />', props: ['modelValue'] },
}

function sectionByType(type: HomepageSection['type']): HomepageSection {
  return structuredClone(DEFAULT_HOMEPAGE_SECTIONS.find((s) => s.type === type)!)
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

  it('applies video list updates onto draft content (not a read-only computed)', async () => {
    const section = sectionByType('video_carousel')
    const wrapper = mount(SectionEditor, {
      props: { section },
      global: { stubs },
    })

    const videos: SectionVideo[] = [
      { id: 'v-new', label: 'New', posterUrl: '', videoUrl: 'https://x', sortOrder: 0 },
    ]
    await wrapper.findComponent({ name: 'VideoUploader' }).vm.$emit('update:modelValue', videos)
    await wrapper.get('form').trigger('submit.prevent')

    const saved = wrapper.emitted('save')?.[0]?.[0] as HomepageSection
    expect(saved).toBeTruthy()
    const savedVideos = (saved.content as VideoCarouselContent).videos as SectionVideo[]
    expect(savedVideos.some((v) => v.id === 'v-new')).toBe(true)
  })
})
