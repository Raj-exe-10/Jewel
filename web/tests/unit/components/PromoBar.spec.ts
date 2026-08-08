import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PromoBar from '../../../src/components/public/PromoBar.vue'

describe('PromoBar', () => {
  it('renders a sensible default message', () => {
    const wrapper = mount(PromoBar)
    expect(wrapper.text()).toContain('WhatsApp')
  })

  it('renders a custom message when provided', () => {
    const wrapper = mount(PromoBar, { props: { message: 'Custom promo message' } })
    expect(wrapper.text()).toContain('Custom promo message')
  })
})
