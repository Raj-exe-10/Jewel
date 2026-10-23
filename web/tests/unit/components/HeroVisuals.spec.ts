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


const push = vi.fn(() => Promise.resolve())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ path: '/' }),
}))
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
