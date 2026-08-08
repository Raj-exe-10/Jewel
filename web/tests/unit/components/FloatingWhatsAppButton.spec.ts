import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FloatingWhatsAppButton from '../../../src/components/public/FloatingWhatsAppButton.vue'

describe('FloatingWhatsAppButton', () => {
  it('renders a fixed-position link to the general enquiry message', () => {
    const wrapper = mount(FloatingWhatsAppButton, {
      props: { businessPhoneE164: '919999999999' },
    })

    const link = wrapper.get('a')
    expect(link.classes()).toContain('fixed')
    const url = new URL(link.attributes('href') ?? '')
    expect(url.hostname).toBe('wa.me')
    expect(url.pathname).toBe('/919999999999')
  })

  it('does not reference any specific product', () => {
    const wrapper = mount(FloatingWhatsAppButton, {
      props: { businessPhoneE164: '919999999999' },
    })
    const url = new URL(wrapper.get('a').attributes('href') ?? '')

    expect(url.searchParams.get('text')).not.toMatch(/necklace|ring|earring/i)
  })
})
