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

  it('shows a dependency warning when provided', () => {
    const wrapper = mount(ConfirmDeleteDialog, {
      props: {
        open: true,
        itemLabel: 'Kundan Choker',
        warning: 'Used on Founder picks.',
      },
    })

    expect(wrapper.get('[data-testid="delete-dependency-warning"]').text()).toContain('Founder picks')
  })
})
