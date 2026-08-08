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

  it('blocks deletion and shows a warning when the entry is still referenced by a product', async () => {
    const wrapper = mount(CategoryManager, {
      props: { items, label: 'Category', isReferenced: (id: string) => id === 'cat-ring' },
    })

    await wrapper.get('[data-testid="remove-item-cat-ring"]').trigger('click')

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.get('[data-testid="reference-warning"]').text()).toMatch(/still (used|referenced)/i)
  })
})
