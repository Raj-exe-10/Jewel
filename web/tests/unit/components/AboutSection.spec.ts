import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AboutSection from '../../../src/components/public/AboutSection.vue'

describe('AboutSection', () => {
  it('renders the founder story heading and copy', () => {
    const wrapper = mount(AboutSection)
    expect(wrapper.text()).toContain('The Hands Behind Amore')
    expect(wrapper.text()).toContain('Amore is a designer jewelry studio')
  })

  it('exposes the #about anchor for nav links', () => {
    const wrapper = mount(AboutSection)
    expect(wrapper.get('section').attributes('id')).toBe('about')
  })
})
