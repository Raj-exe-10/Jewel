import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), onSnapshot: vi.fn() }))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useCatalogueNav } = await import('../../../src/composables/useCatalogueNav')

function withCatalogueEl() {
  document.body.innerHTML = '<div id="catalogue"></div>'
  const el = document.getElementById('catalogue')!
  const scrollSpy = vi.fn()
  el.scrollIntoView = scrollSpy
  return scrollSpy
}

describe('useCatalogueNav', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('filterByCategory sets the category filter, clears others, and scrolls to the catalogue', () => {
    const scrollSpy = withCatalogueEl()
    const store = useCatalogueStore()
    store.$patch({ filters: { ...store.filters, searchTerm: 'gold' } })

    const nav = useCatalogueNav()
    nav.filterByCategory('cat-1')

    expect(store.filters.categoryId).toBe('cat-1')
    expect(store.filters.searchTerm).toBe('')
    expect(scrollSpy).toHaveBeenCalled()
  })

  it('filterByCollection sets the collection filter', () => {
    withCatalogueEl()
    const store = useCatalogueStore()
    useCatalogueNav().filterByCollection('col-1')
    expect(store.filters.collectionId).toBe('col-1')
  })

  it('filterByStyleTag sets the style tag filter', () => {
    withCatalogueEl()
    const store = useCatalogueStore()
    useCatalogueNav().filterByStyleTag('tag-1')
    expect(store.filters.styleTagId).toBe('tag-1')
  })

  it('filterByBridal sets isBridal true', () => {
    withCatalogueEl()
    const store = useCatalogueStore()
    useCatalogueNav().filterByBridal()
    expect(store.filters.isBridal).toBe(true)
  })

  it('clearAndScrollToCatalogue resets filters and scrolls', () => {
    const scrollSpy = withCatalogueEl()
    const store = useCatalogueStore()
    store.setFilters({ isBridal: true })

    useCatalogueNav().clearAndScrollToCatalogue()

    expect(store.filters.isBridal).toBeNull()
    expect(scrollSpy).toHaveBeenCalled()
  })

  it('scrollToSection is a no-op when the target element is missing', () => {
    document.body.innerHTML = ''
    expect(() => useCatalogueNav().scrollToSection('missing')).not.toThrow()
  })
})
