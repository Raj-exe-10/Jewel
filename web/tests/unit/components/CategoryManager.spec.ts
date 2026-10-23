import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn().mockResolvedValue(undefined),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
  splitFolder: vi.fn((folder) => {
    const parts = String(folder).split('/').filter(Boolean)
    return { bucket: parts[0] ?? 'product-photos', prefix: parts.slice(1).join('/') }
  }),
  publicObjectUrl: vi.fn(() => 'https://example.com/file'),
  parsePublicUrl: vi.fn(),
}))

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

  it('UI-NEG-05: blocks remove when referenced and shows warning; does not emit remove', async () => {
    const wrapper = mount(CategoryManager, {
      props: {
        items,
        label: 'Category',
        isReferenced: (id: string) => id === 'cat-necklace',
      },
    })

    await wrapper.get('[data-testid="remove-item-cat-necklace"]').trigger('click')
    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.get('[data-testid="reference-warning"]').text()).toMatch(/still used/i)
  })
})
