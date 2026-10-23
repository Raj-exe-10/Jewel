import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createSectionDraft } from '../../../src/data/defaultSections'
import InstagramGallery from '../../../src/components/public/InstagramGallery.vue'

const section = createSectionDraft('instagram_gallery')

describe('InstagramGallery', () => {
  it('renders the handle and a gallery of tiles linking to Instagram', () => {
    const wrapper = mount(InstagramGallery, {
      props: { instagramHandle: '@amore.jewelry', section },
    })

    expect(wrapper.text()).toContain('@amore.jewelry')
    const tiles = wrapper.findAll('[data-testid="instagram-tile"]')
    expect(tiles.length).toBeGreaterThan(0)
    tiles.forEach((tile) => {
      expect(tile.attributes('href')).toBe('https://instagram.com/amore.jewelry')
    })
  })

  it('normalizes a handle without a leading @', () => {
    const wrapper = mount(InstagramGallery, {
      props: { instagramHandle: 'amore.jewelry', section },
    })
    expect(wrapper.get('[data-testid="instagram-profile-link"]').attributes('href')).toBe(
      'https://instagram.com/amore.jewelry',
    )
  })
})
