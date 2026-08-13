import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConfirmDialog from '../../../src/components/admin/ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('shows the message and does not emit confirm until clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Restore default layout',
        message: 'This will replace the current homepage layout.',
        confirmLabel: 'Restore',
      },
    })

    expect(wrapper.text()).toContain('This will replace the current homepage layout.')
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('emits confirm when the confirm button is clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Set as default',
        message: 'Save the current layout?',
        confirmLabel: 'Save',
      },
    })

    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel when cancel is clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Restore',
        message: 'Sure?',
        confirmLabel: 'Restore',
      },
    })

    await wrapper.get('[data-testid="confirm-dialog-cancel"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('can show a notice-only mode with a dismiss button', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Done',
        message: 'Default layout restored.',
        confirmLabel: 'OK',
        noticeOnly: true,
      },
    })

    expect(wrapper.find('[data-testid="confirm-dialog-cancel"]').exists()).toBe(false)
    await wrapper.get('[data-testid="confirm-dialog-confirm"]').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })
})
