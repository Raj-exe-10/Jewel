import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const HeroBanner = (await import('../../../src/components/public/HeroBanner.vue')).default

describe('HeroBanner', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = '<div id="catalogue"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
  })

  it('renders a slide for each curated banner', () => {
    const wrapper = mount(HeroBanner)
    expect(wrapper.findAll('[data-testid="hero-banner-slide"]').length).toBeGreaterThanOrEqual(2)
  })

  it('renders prev/next controls', () => {
    const wrapper = mount(HeroBanner)
    expect(wrapper.find('[data-testid="hero-banner-prev"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="hero-banner-next"]').exists()).toBe(true)
  })

  it('clicking the bridal slide CTA filters the catalogue to bridal products', async () => {
    const store = useCatalogueStore()
    const wrapper = mount(HeroBanner)

    const ctas = wrapper.findAll('[data-testid="hero-banner-cta"]')
    await ctas[0]!.trigger('click')

    expect(store.filters.isBridal).toBe(true)
  })
})
