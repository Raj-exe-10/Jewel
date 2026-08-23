import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category, Collection, StyleTag } from '../../../src/types/catalogue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/' }),
  RouterLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to?.path ?? \'#\'"><slot /></a>',
  },
}))
vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

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
