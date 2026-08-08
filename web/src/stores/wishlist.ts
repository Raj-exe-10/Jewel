import { defineStore } from 'pinia'

// FR-009: session/device-local favorites, no login, no server sync.
const STORAGE_KEY = 'amore:wishlist'

function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeToStorage(productIds: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds))
}

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    productIds: [] as string[],
  }),
  getters: {
    isWishlisted: (state) => (productId: string) => state.productIds.includes(productId),
  },
  actions: {
    load() {
      this.productIds = readFromStorage()
    },
    toggle(productId: string) {
      this.productIds = this.productIds.includes(productId)
        ? this.productIds.filter((id) => id !== productId)
        : [...this.productIds, productId]
      writeToStorage(this.productIds)
    },
  },
})
