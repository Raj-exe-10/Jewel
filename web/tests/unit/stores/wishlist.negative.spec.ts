import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useWishlistStore } from '../../../src/stores/wishlist'

const STORAGE_KEY = 'amore:wishlist'

describe('wishlist negative / corrupt storage', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('recovers to empty list when localStorage JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')
    const store = useWishlistStore()
    store.load()
    expect(store.productIds).toEqual([])
  })

  it('ignores non-array JSON payloads', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: ['p1'] }))
    const store = useWishlistStore()
    store.load()
    expect(store.productIds).toEqual([])
  })
})
