import { createPinia, setActivePinia } from 'pinia'
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
const route = { path: '/' }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => route,
}))
const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useCatalogueNav } = await import('../../../src/composables/useCatalogueNav')

describe('useCatalogueNav', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockClear()
    route.path = '/'
    document.body.innerHTML = ''
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('filterByCategory sets the category filter, clears others, and opens /collection', async () => {
    const store = useCatalogueStore()
    store.$patch({ filters: { ...store.filters, searchTerm: 'gold' } })

    const nav = useCatalogueNav()
    nav.filterByCategory('cat-1')
    await Promise.resolve()

    expect(store.filters.categoryId).toBe('cat-1')
    expect(store.filters.searchTerm).toBe('')
    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
  })

  it('filterByCollection sets the collection filter and opens collection page', async () => {
    const store = useCatalogueStore()
    useCatalogueNav().filterByCollection('col-1')
    await Promise.resolve()
    expect(store.filters.collectionId).toBe('col-1')
    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
  })

  it('filterByStyleTag sets the style tag filter and opens collection page', async () => {
    const store = useCatalogueStore()
    useCatalogueNav().filterByStyleTag('tag-1')
    await Promise.resolve()
    expect(store.filters.styleTagId).toBe('tag-1')
    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
  })

  it('filterByBridal sets isBridal true and opens collection page', async () => {
    const store = useCatalogueStore()
    useCatalogueNav().filterByBridal()
    await Promise.resolve()
    expect(store.filters.isBridal).toBe(true)
    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
  })

  it('clearAndScrollToCatalogue resets filters and opens collection page at products', async () => {
    const store = useCatalogueStore()
    store.setFilters({ isBridal: true })

    useCatalogueNav().clearAndScrollToCatalogue()
    await Promise.resolve()

    expect(store.filters.isBridal).toBeNull()
    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
  })

  it('openCollectionPage clears filters, opens /collection without products hash, and scrolls to top', async () => {
    const store = useCatalogueStore()
    store.setFilters({ isBridal: true, searchTerm: 'gold' })

    await useCatalogueNav().openCollectionPage()

    expect(store.filters.isBridal).toBeNull()
    expect(store.filters.searchTerm).toBe('')
    expect(push).toHaveBeenCalledWith({ name: 'collection' })
    expect(push).not.toHaveBeenCalledWith(expect.objectContaining({ hash: '#collection-products' }))
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('scrollToSection is a no-op when the target element is missing', () => {
    document.body.innerHTML = ''
    expect(() => useCatalogueNav().scrollToSection('missing')).not.toThrow()
  })

  it('goToCollection scrolls to collection-products after navigation', async () => {
    document.body.innerHTML = '<div id="collection-products"></div>'
    const el = document.getElementById('collection-products')!
    el.getBoundingClientRect = () =>
      ({ top: 400, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect

    await useCatalogueNav().goToCollection()

    expect(push).toHaveBeenCalledWith({ name: 'collection', hash: '#collection-products' })
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
  })

  it('goToHomeSection pushes hash and scrolls when already on home', async () => {
    document.body.innerHTML = '<div id="about"></div>'
    const el = document.getElementById('about')!
    el.getBoundingClientRect = () =>
      ({ top: 500, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
    route.path = '/'

    await useCatalogueNav().goToHomeSection('about')

    expect(push).toHaveBeenCalledWith({ path: '/', hash: '#about' })
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
  })

  it('goToHomeSection navigates to home with hash when off home', async () => {
    route.path = '/collection'

    await useCatalogueNav().goToHomeSection('about')

    expect(push).toHaveBeenCalledWith({ path: '/', hash: '#about' })
  })

  it('scrollToSection uses extra gap for homepage product carousels', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    document.body.innerHTML = '<div id="shop-the-visuals-products"></div>'
    const el = document.getElementById('shop-the-visuals-products')!
    el.getBoundingClientRect = () =>
      ({ top: 500, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect

    useCatalogueNav().scrollToSection('shop-the-visuals-products')

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 364, behavior: 'smooth' })
  })

  it('scrollToSection uses standard offset for non-carousel sections', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    document.body.innerHTML = '<div id="about"></div>'
    const el = document.getElementById('about')!
    el.getBoundingClientRect = () =>
      ({ top: 500, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect

    useCatalogueNav().scrollToSection('about')

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 388, behavior: 'smooth' })
  })
})
