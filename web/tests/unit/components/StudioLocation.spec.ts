import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StudioLocation from '../../../src/components/public/StudioLocation.vue'

describe('StudioLocation', () => {
  it('renders a placeholder address plus directions and appointment CTAs', () => {
    const wrapper = mount(StudioLocation, { props: { businessPhoneE164: '919999999999' } })

    expect(wrapper.find('[data-testid="studio-address"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="studio-directions-link"]').exists()).toBe(true)

    const appointmentLink = wrapper.get('[data-testid="studio-appointment-link"]')
    expect(appointmentLink.attributes('href')).toContain('919999999999')
  })
})
