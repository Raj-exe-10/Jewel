import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { auth, db } from '../firebase/config'

const DEFAULT_PRODUCTS_PER_ROW = 10
const MIN_PRODUCTS_PER_ROW = 1
const MAX_PRODUCTS_PER_ROW = 10

function isValidProductsPerRow(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_PRODUCTS_PER_ROW &&
    value <= MAX_PRODUCTS_PER_ROW
  )
}

export const useCollectionPageStore = defineStore('collectionPage', {
  state: () => ({
    productsPerRow: DEFAULT_PRODUCTS_PER_ROW,
    isLoading: false,
    unsubscribe: null as (() => void) | null,
  }),
  actions: {
    subscribeToConfig() {
      this.unsubscribe?.()
      this.isLoading = true
      this.unsubscribe = onSnapshot(doc(db, 'catalogueConfig', 'collectionPage'), (snapshot) => {
        const value = snapshot.exists() ? snapshot.data().productsPerRow : undefined
        this.productsPerRow = isValidProductsPerRow(value) ? value : DEFAULT_PRODUCTS_PER_ROW
        this.isLoading = false
      })
    },
    async saveProductsPerRow(value: number) {
      if (!isValidProductsPerRow(value)) {
        throw new Error(
          `Products per row must be between ${MIN_PRODUCTS_PER_ROW} and ${MAX_PRODUCTS_PER_ROW}.`,
        )
      }
      await setDoc(
        doc(db, 'catalogueConfig', 'collectionPage'),
        {
          productsPerRow: value,
          updatedAt: Date.now(),
          updatedBy: auth.currentUser?.uid ?? 'unknown',
        },
        { merge: true },
      )
      this.productsPerRow = value
    },
  },
})
