import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConfirmDeleteDialog from '../../../src/components/admin/ConfirmDeleteDialog.vue'

describe('ConfirmDeleteDialog', () => {
  it('does not emit confirm until the user explicitly confirms', async () => {
    const wrapper = mount(ConfirmDeleteDialog, {
      props: { open: true, itemLabel: 'Kundan Choker Necklace' },
    })

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.text()).toContain('Kundan Choker Necklace')
  })

  it('emits confirm when the confirm button is clicked', async () => {
    const wrapper = mount(ConfirmDeleteDialog, {
      props: { open: true, itemLabel: 'Kundan Choker Necklace' },
    })

    await wrapper.get('[data-testid="confirm-delete"]').trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel and never confirm when the cancel button is clicked', async () => {
    const wrapper = mount(ConfirmDeleteDialog, {
      props: { open: true, itemLabel: 'Kundan Choker Necklace' },
    })

    await wrapper.get('[data-testid="cancel-delete"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('renders nothing interactive when closed', () => {
    const wrapper = mount(ConfirmDeleteDialog, {
      props: { open: false, itemLabel: 'Kundan Choker Necklace' },
    })

    expect(wrapper.find('[data-testid="confirm-delete"]').exists()).toBe(false)
  })
})
