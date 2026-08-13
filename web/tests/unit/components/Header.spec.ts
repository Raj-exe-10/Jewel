import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useWishlistStore } = await import('../../../src/stores/wishlist')
const Header = (await import('../../../src/components/public/Header.vue')).default

const category: Category = { id: 'cat-ring', name: 'Rings', sortOrder: 0, createdAt: 0 }

function mountHeader() {
  return mount(Header, { props: { businessPhoneE164: '911234567890' }, attachTo: document.body })
}

describe('Header', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    const el = document.getElementById('catalogue')!
    el.scrollIntoView = vi.fn()
  })

  it('renders the brand name and a WhatsApp CTA using the business phone number', () => {
    const wrapper = mountHeader()
    expect(wrapper.text()).toContain('Amore')
    const cta = wrapper.get('[data-testid="header-whatsapp-cta"]')
    expect(cta.attributes('href')).toContain('911234567890')
  })

  it('does not render any cart, account, or currency UI', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('[data-testid*="cart"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid*="account"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid*="currency"]').exists()).toBe(false)
  })

  it('selecting a category from the Categories dropdown filters the catalogue', async () => {
    const store = useCatalogueStore()
    store.$patch({ categories: [category] })
    const wrapper = mountHeader()

    await wrapper.get('[data-testid="nav-categories-toggle"]').trigger('click')
    await wrapper.get('[data-testid="nav-categories-item-cat-ring"]').trigger('click')

    expect(store.filters.categoryId).toBe('cat-ring')
  })

  it('clicking Bridal/Wedding filters to bridal products', async () => {
    const store = useCatalogueStore()
    const wrapper = mountHeader()

    await wrapper.get('[data-testid="nav-bridal"]').trigger('click')

    expect(store.filters.isBridal).toBe(true)
  })

  it('shows a wishlist count badge only when items are wishlisted', async () => {
    const wishlist = useWishlistStore()
    const wrapper = mountHeader()
    expect(wrapper.find('[data-testid="wishlist-count"]').exists()).toBe(false)

    wishlist.toggle('prod-1')
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-testid="wishlist-count"]').text()).toBe('1')
  })

  it('opens the wishlist drawer when the heart icon is clicked', async () => {
    const wrapper = mountHeader()
    expect(document.querySelector('[data-testid="wishlist-drawer"]')).toBeNull()

    await wrapper.get('[data-testid="wishlist-link"]').trigger('click')
    expect(document.querySelector('[data-testid="wishlist-drawer"]')).not.toBeNull()
  })

  it('places the Amore brand logo before the navigation links', () => {
    const wrapper = mountHeader()
    const row = wrapper.get('[data-testid="brand-logo"]').element.parentElement!
    const children = Array.from(row.children)
    const logoIndex = children.findIndex((el) => el.getAttribute('data-testid') === 'brand-logo')
    const navIndex = children.findIndex((el) => el.tagName === 'NAV')
    expect(logoIndex).toBeGreaterThanOrEqual(0)
    expect(navIndex).toBeGreaterThan(logoIndex)
  })

  it('toggles the search overlay when the search icon is clicked', async () => {
    const wrapper = mountHeader()
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(false)

    await wrapper.get('[data-testid="search-toggle"]').trigger('click')
    expect(wrapper.find('[data-testid="search-overlay"]').exists()).toBe(true)
  })

  it('toggles the mobile menu panel', async () => {
    const wrapper = mountHeader()
    expect(wrapper.find('[data-testid="mobile-menu-panel"]').exists()).toBe(false)

    await wrapper.get('[data-testid="mobile-menu-toggle"]').trigger('click')
    expect(wrapper.find('[data-testid="mobile-menu-panel"]').exists()).toBe(true)
  })
})
