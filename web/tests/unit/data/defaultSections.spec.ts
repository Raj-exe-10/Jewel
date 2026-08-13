import { describe, expect, it } from 'vitest'
import {
  createSectionDraft,
  DEFAULT_HOMEPAGE_SECTIONS,
  uniqueSectionTitle,
} from '../../../src/data/defaultSections'
import type { SectionType } from '../../../src/types/homepage'

describe('DEFAULT_HOMEPAGE_SECTIONS', () => {
  it('seeds every storefront section in the current homepage order', () => {
    const types = DEFAULT_HOMEPAGE_SECTIONS.map((section) => section.type)
    expect(types).toEqual([
      'hero_banner',
      'video_carousel',
      'product_carousel',
      'style_tiles',
      'category_grid',
      'collection_tiles',
      'product_carousel',
      'catalogue_grid',
      'about',
      'instagram_gallery',
      'studio_location',
      'contact',
    ])
  })

  it('assigns sequential sort order and visible flags', () => {
    DEFAULT_HOMEPAGE_SECTIONS.forEach((section, index) => {
      expect(section.sortOrder).toBe(index)
      expect(section.isVisible).toBe(true)
      expect(section.anchorId.length).toBeGreaterThan(0)
    })
  })

  it('configures Founder Favourites by flag and Bridal by flag with the bridal layout', () => {
    const founders = DEFAULT_HOMEPAGE_SECTIONS.find((s) => s.anchorId === 'founders-favourites')
    const bridal = DEFAULT_HOMEPAGE_SECTIONS.find((s) => s.anchorId === 'bridal')
    expect(founders?.productFlag).toBe('isFounderFavourite')
    expect(founders?.productSelectionMode).toBe('flag')
    expect(bridal?.productFlag).toBe('isBridal')
    expect((bridal?.content as { variant?: string }).variant).toBe('bridal')
  })
})

describe('createSectionDraft', () => {
  it('creates a visible section of the requested type with the next sort order', () => {
    const draft = createSectionDraft('about', 12)
    expect(draft.type).toBe('about')
    expect(draft.sortOrder).toBe(12)
    expect(draft.isVisible).toBe(true)
    expect(draft.title.length).toBeGreaterThan(0)
  })

  it('makes the title unique when the template title already exists', () => {
    const draft = createSectionDraft('video_carousel', 12, ['Shop the Visuals'])
    expect(draft.title).toBe('Shop the Visuals 2')
  })

  it.each([
    'hero_banner',
    'video_carousel',
    'product_carousel',
    'contact',
  ] satisfies SectionType[])('returns a draft for %s', (type) => {
    expect(createSectionDraft(type, 0).type).toBe(type)
  })
})

describe('uniqueSectionTitle', () => {
  it('returns the base title when unused', () => {
    expect(uniqueSectionTitle('Shop the Visuals', [])).toBe('Shop the Visuals')
  })

  it('appends an incrementing suffix for collisions (case-insensitive)', () => {
    expect(uniqueSectionTitle('Shop the Visuals', ['shop the visuals', 'Shop the Visuals 2'])).toBe(
      'Shop the Visuals 3',
    )
  })
})
