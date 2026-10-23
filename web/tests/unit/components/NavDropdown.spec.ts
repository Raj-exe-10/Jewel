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
