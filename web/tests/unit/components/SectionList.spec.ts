import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionList from '../../../src/components/admin/SectionList.vue'
import { DEFAULT_HOMEPAGE_SECTIONS } from '../../../src/data/defaultSections'

describe('SectionList', () => {
  it('renders a row for each section including a hidden badge', () => {
    const sections = [
      { ...DEFAULT_HOMEPAGE_SECTIONS[2]!, isVisible: true },
      { ...DEFAULT_HOMEPAGE_SECTIONS[8]!, isVisible: false },
    ]
    const wrapper = mount(SectionList, { props: { sections } })

    expect(wrapper.get('[data-testid="section-list"]').text()).toContain('Diamonds & Engagement Ring')
    expect(wrapper.text()).toContain('Hidden')
  })

  it('emits toggle, edit, and remove for the chosen section', async () => {
    const section = DEFAULT_HOMEPAGE_SECTIONS[2]!
    const wrapper = mount(SectionList, { props: { sections: [section] } })

    await wrapper.get('[data-testid="toggle-section-visibility"]').trigger('click')
    await wrapper.get('[data-testid="edit-section"]').trigger('click')
    await wrapper.get('[data-testid="delete-section"]').trigger('click')

    expect(wrapper.emitted('toggle')?.[0]).toEqual([section.id])
    expect(wrapper.emitted('edit')?.[0]).toEqual([section.id])
    expect(wrapper.emitted('remove')?.[0]).toEqual([section.id])
  })
})
