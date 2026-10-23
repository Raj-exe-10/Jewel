import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

import type { Category, Collection, StyleTag } from '../../../src/types/catalogue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/' }),
  RouterLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to?.path ?? \'#\'"><slot /></a>',
  },
}))
const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const Footer = (await import('../../../src/components/public/Footer.vue')).default

const category: Category = { id: 'cat-1', name: 'Necklace', sortOrder: 0, createdAt: 0 }
const collectionItem: Collection = { id: 'col-1', name: 'Jadau Kundan', sortOrder: 0, createdAt: 0 }
const styleTag: StyleTag = { id: 'tag-1', name: 'Festive', sortOrder: 0, createdAt: 0 }

function mountFooter() {
  return mount(Footer, { props: { instagramHandle: '@amore.jewelry', businessPhoneE164: '919999999999' } })
}

describe('Footer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders brand blurb, WhatsApp, and Instagram links (no account/shipping/cart copy)', () => {
    const wrapper = mountFooter()

    expect(wrapper.text()).toContain('Amore')
    expect(wrapper.get('a[href*="wa.me"]').exists()).toBe(true)
    expect(wrapper.get('a[href*="instagram.com/amore.jewelry"]').exists()).toBe(true)
    expect(wrapper.text()).not.toMatch(/sign in|register|shipping|returns|track.*order/i)
  })

  it('lists categories/collections/styles as clickable filters when taxonomy exists', async () => {
    const store = useCatalogueStore()
    store.$patch({ categories: [category], collections: [collectionItem], styleTags: [styleTag] })

    const wrapper = mountFooter()

    expect(wrapper.get('[data-testid="footer-categories"]').text()).toContain('Necklace')
    await wrapper.get('[data-testid="footer-categories"] button').trigger('click')
    expect(store.filters.categoryId).toBe('cat-1')

    await wrapper.get('[data-testid="footer-collections"] button').trigger('click')
    expect(store.filters.collectionId).toBe('col-1')

    await wrapper.get('[data-testid="footer-styles"] button').trigger('click')
    expect(store.filters.styleTagId).toBe('tag-1')
  })

  it('renders the current year in the copyright line', () => {
    const wrapper = mountFooter()
    expect(wrapper.text()).toContain(String(new Date().getFullYear()))
  })
})
