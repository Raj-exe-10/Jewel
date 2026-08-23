import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn(() => Promise.resolve())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ path: '/' }),
}))
vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const HeroVisuals = (await import('../../../src/components/public/HeroVisuals.vue')).default

describe('HeroVisuals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockClear()
    document.body.innerHTML = '<div id="catalogue"></div><div id="collection-products"></div>'
    document.getElementById('catalogue')!.scrollIntoView = vi.fn()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('renders the "Shop the Visuals" heading', () => {
    const wrapper = mount(HeroVisuals)
    expect(wrapper.text()).toContain('Shop the Visuals')
  })

  it('renders a video tile for each curated visual', () => {
    const wrapper = mount(HeroVisuals)
    const tiles = wrapper.findAll('[data-testid="shop-visuals-tile"]')
    expect(tiles.length).toBeGreaterThan(0)
    expect(wrapper.findAll('video').length).toBe(tiles.length)
  })

  it('exposes prev/next controls', () => {
    const wrapper = mount(HeroVisuals)
    expect(wrapper.find('[data-testid="shop-visuals-prev"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="shop-visuals-next"]').exists()).toBe(true)
  })

  it('exposes a products carousel anchor for nav scroll', () => {
    const wrapper = mount(HeroVisuals)
    expect(wrapper.find('#shop-the-visuals-products').exists()).toBe(true)
  })

  it('clicking a tile navigates to the collection', async () => {
    const wrapper = mount(HeroVisuals)

    await wrapper.get('[data-testid="shop-visuals-tile"]').trigger('click')
    await Promise.resolve()

    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
  })
})
