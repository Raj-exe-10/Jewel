import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_HOMEPAGE_SECTIONS } from '../../../src/data/defaultSections'




const HomepageRenderer = (await import('../../../src/components/public/HomepageRenderer.vue')).default

describe('HomepageRenderer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
  })

  it('renders a hero banner from the section list', () => {
    const wrapper = mount(HomepageRenderer, {
      props: {
        sections: DEFAULT_HOMEPAGE_SECTIONS.filter((section) => section.type === 'hero_banner'),
        businessPhoneE164: '919999999999',
        instagramHandle: 'amore.jewelry',
      },
    })

    expect(wrapper.find('[data-testid="hero-banner"]').exists()).toBe(true)
  })
})
