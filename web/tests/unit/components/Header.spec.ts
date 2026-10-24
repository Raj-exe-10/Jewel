import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '../../../src/types/catalogue'

const push = vi.fn(() => Promise.resolve())

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/' }),
  useRouter: () => ({ push }),
  RouterLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to.path" data-testid="brand-logo-stub"><slot /></a>',
  },
}))



const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useWishlistStore } = await import('../../../src/stores/wishlist')
const Header = (await import('../../../src/components/public/Header.vue')).default

const category: Category = { id: 'cat-ring', name: 'Rings', sortOrder: 0, createdAt: 0 }

function mountHeader() {
  return mount(Header, {
    props: { businessPhoneE164: '911234567890' },
    attachTo: document.body,
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a :href="typeof to === \'string\' ? to : to?.path ?? \'#\'" v-bind="$attrs"><slot /></a>',
        },
      },
    },
  })
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
    expect(wrapper.text()).toContain('AMORE')
    const cta = wrapper.get('[data-testid="header-whatsapp-cta"]')
    expect(cta.attributes('href')).toContain('911234567890')
  })

  it('links the Amore brand logo to the home page', () => {
    const wrapper = mountHeader()
    const logo = wrapper.get('[data-testid="brand-logo"]')
    expect(logo.attributes('href')).toBe('/')
  })

  it('shows the Amore crest image next to the brand wordmark', () => {
    const wrapper = mountHeader()
    const crest = wrapper.get('[data-testid="brand-logo"] img')
    expect(crest.attributes('src')).toContain('amore-logo')
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

  it('centers the Amore brand logo in the header row', () => {
    const wrapper = mountHeader()
    const logo = wrapper.get('[data-testid="brand-logo"]')
    expect(logo.exists()).toBe(true)
    expect(logo.classes().join(' ')).toMatch(/absolute|md:static/)
    expect(logo.text()).toMatch(/amore/i)
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

  it('shows the five mobile nav items and omits Bridal', async () => {
    const wrapper = mountHeader()
    await wrapper.get('[data-testid="mobile-menu-toggle"]').trigger('click')
    const panel = wrapper.get('[data-testid="mobile-menu-panel"]')

    expect(panel.text()).toContain('New Arrivals')
    expect(panel.text()).toContain('Signature Picks')
    expect(panel.text()).toContain('Collection')
    expect(panel.text()).toContain('About')
    expect(panel.text()).toContain('Contact')
    expect(panel.find('[data-testid="mobile-nav-bridal"]').exists()).toBe(false)
    expect(panel.text()).not.toContain('Bridal')
  })

  it('opens the collection page from the mobile Collection item', async () => {
    const store = useCatalogueStore()
    store.setFilters({ isBridal: true })
    push.mockClear()
    const wrapper = mountHeader()

    await wrapper.get('[data-testid="mobile-menu-toggle"]').trigger('click')
    await wrapper.get('[data-testid="mobile-nav-collection"]').trigger('click')
    // Flush menu-close layout wait (double rAF) + openCollectionPage
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await Promise.resolve()
    await Promise.resolve()

    expect(store.filters.isBridal).toBeNull()
    expect(push).toHaveBeenCalledWith({ name: 'collection' })
  })

  it('scrolls New Arrivals to the product carousel anchor', async () => {
    document.body.innerHTML += '<div id="founders-favourites-products"></div>'
    const el = document.getElementById('founders-favourites-products')!
    el.getBoundingClientRect = () =>
      ({ top: 400, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    push.mockClear()

    const wrapper = mountHeader()
    await wrapper.get('[data-testid="mobile-menu-toggle"]').trigger('click')
    await wrapper.get('[data-testid="mobile-nav-new-arrivals"]').trigger('click')
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await Promise.resolve()
    await Promise.resolve()

    expect(push).toHaveBeenCalledWith({ path: '/', hash: '#founders-favourites-products' })
  })

  it('scrolls Signature Picks to the product carousel anchor', async () => {
    document.body.innerHTML += '<div id="founders-favourites-products"></div>'
    const el = document.getElementById('founders-favourites-products')!
    el.getBoundingClientRect = () =>
      ({ top: 500, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    push.mockClear()

    const wrapper = mountHeader()
    await wrapper.get('[data-testid="mobile-menu-toggle"]').trigger('click')
    await wrapper.get('[data-testid="mobile-nav-signature-picks"]').trigger('click')
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await Promise.resolve()
    await Promise.resolve()

    expect(push).toHaveBeenCalledWith({ path: '/', hash: '#founders-favourites-products' })
  })
})
