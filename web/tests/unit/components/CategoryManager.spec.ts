import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CategoryManager from '../../../src/components/admin/CategoryManager.vue'

describe('CategoryManager', () => {
  const items = [
    { id: 'cat-necklace', name: 'Necklace' },
    { id: 'cat-ring', name: 'Rings' },
  ]

  it('emits add with the entered name', async () => {
    const wrapper = mount(CategoryManager, {
      props: { items, label: 'Category', isReferenced: () => false },
    })

    await wrapper.get('[data-testid="new-item-name"]').setValue('Bangles')
    await wrapper.get('[data-testid="add-item"]').trigger('click')

    expect(wrapper.emitted('add')).toEqual([['Bangles']])
  })

  it('removes an entry immediately when it is not referenced by any product', async () => {
    const wrapper = mount(CategoryManager, {
      props: { items, label: 'Category', isReferenced: () => false },
    })

    await wrapper.get('[data-testid="remove-item-cat-ring"]').trigger('click')

    expect(wrapper.emitted('remove')).toEqual([['cat-ring']])
    expect(wrapper.find('[data-testid="reference-warning"]').exists()).toBe(false)
  })

  it('blocks adding a duplicate name (case-insensitive) and shows an error', async () => {
    const wrapper = mount(CategoryManager, {
      props: { items, label: 'Category', isReferenced: () => false },
    })

    await wrapper.get('[data-testid="new-item-name"]').setValue('necklace')
    await wrapper.get('[data-testid="add-item"]').trigger('click')

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.get('[data-testid="duplicate-warning"]').text()).toMatch(/already exists/i)
  })
})
