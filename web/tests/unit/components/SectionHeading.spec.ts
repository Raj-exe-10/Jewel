import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionHeading from '../../../src/components/public/SectionHeading.vue'

describe('SectionHeading', () => {
  it('renders a centered title with optional icon and subtitle', () => {
    const wrapper = mount(SectionHeading, {
      props: { title: "Founder's Favourites", subtitle: 'Curated picks', icon: '◇' },
    })

    expect(wrapper.get('[data-testid="section-heading"]').classes().join(' ')).toContain('text-center')
    expect(wrapper.text()).toContain("Founder's Favourites")
    expect(wrapper.text()).toContain('Curated picks')
    expect(wrapper.text()).toContain('◇')
  })
})
