import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NavDropdown from '../../../src/components/public/NavDropdown.vue'

const items = [
  { id: 'cat-1', name: 'Necklace' },
  { id: 'cat-2', name: 'Earring' },
]

describe('NavDropdown', () => {
  it('is closed by default and opens the panel on toggle click', async () => {
    const wrapper = mount(NavDropdown, { props: { label: 'Categories', items, testid: 'nav-categories' } })

    expect(wrapper.find('[data-testid="nav-categories-panel"]').exists()).toBe(false)

    await wrapper.get('[data-testid="nav-categories-toggle"]').trigger('click')

    expect(wrapper.find('[data-testid="nav-categories-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Necklace')
    expect(wrapper.text()).toContain('Earring')
  })

  it('emits select with the item id and closes the panel when an item is clicked', async () => {
    const wrapper = mount(NavDropdown, { props: { label: 'Categories', items, testid: 'nav-categories' } })

    await wrapper.get('[data-testid="nav-categories-toggle"]').trigger('click')
    await wrapper.get('[data-testid="nav-categories-item-cat-2"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual(['cat-2'])
    expect(wrapper.find('[data-testid="nav-categories-panel"]').exists()).toBe(false)
  })

  it('shows a "Coming soon" placeholder when there are no items', async () => {
    const wrapper = mount(NavDropdown, { props: { label: 'Collections', items: [], testid: 'nav-collections' } })

    await wrapper.get('[data-testid="nav-collections-toggle"]').trigger('click')

    expect(wrapper.text()).toContain('Coming soon')
  })
})
