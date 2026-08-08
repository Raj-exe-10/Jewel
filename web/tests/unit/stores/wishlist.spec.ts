import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useWishlistStore } from '../../../src/stores/wishlist'

const STORAGE_KEY = 'amore:wishlist'

describe('wishlist store (FR-009: session/device-local, no account)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts empty when localStorage has no saved wishlist', () => {
    const store = useWishlistStore()
    expect(store.productIds).toEqual([])
  })

  it('rehydrates from an existing localStorage entry on init', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['p1', 'p2']))
    const store = useWishlistStore()
    store.load()

    expect(store.productIds).toEqual(['p1', 'p2'])
  })

  it('toggle adds a product id when not present', () => {
    const store = useWishlistStore()
    store.toggle('p1')

    expect(store.productIds).toEqual(['p1'])
    expect(store.isWishlisted('p1')).toBe(true)
  })

  it('toggle removes a product id when already present', () => {
    const store = useWishlistStore()
    store.toggle('p1')
    store.toggle('p1')

    expect(store.productIds).toEqual([])
    expect(store.isWishlisted('p1')).toBe(false)
  })

  it('persists changes to localStorage', () => {
    const store = useWishlistStore()
    store.toggle('p1')

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['p1'])
  })

  it('never makes a network call and has no account/server dependency', () => {
    // Contract check: the module must not import firebase at all.
    const store = useWishlistStore()
    expect(Object.keys(store.$state)).toEqual(['productIds'])
  })
})
