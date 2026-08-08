import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { auth, db } from '../firebase/config'
import {
  EMPTY_FILTERS,
  type CatalogueFilters,
  type Category,
  type Collection,
  type NamedTaxonomyInput,
  type Product,
  type ProductInput,
  type StyleTag,
} from '../types/catalogue'

type TaxonomyName = 'categories' | 'collections' | 'styleTags'

interface CatalogueState {
  products: Product[]
  categories: Category[]
  collections: Collection[]
  styleTags: StyleTag[]
  filters: CatalogueFilters
  isLoading: boolean
  unsubscribers: Array<() => void>
}

export const useCatalogueStore = defineStore('catalogue', {
  state: (): CatalogueState => ({
    products: [],
    categories: [],
    collections: [],
    styleTags: [],
    filters: { ...EMPTY_FILTERS },
    isLoading: false,
    unsubscribers: [],
  }),
  getters: {
    filteredProducts(state): Product[] {
      const term = state.filters.searchTerm.trim().toLowerCase()
      return state.products.filter((product) => {
        if (state.filters.categoryId && product.categoryId !== state.filters.categoryId) return false
        if (state.filters.collectionId && product.collectionId !== state.filters.collectionId) return false
        if (state.filters.styleTagId && !product.styleTagIds.includes(state.filters.styleTagId)) return false
        if (state.filters.isBridal !== null && product.isBridal !== state.filters.isBridal) return false
        if (term) {
          const haystack = `${product.name} ${product.description}`.toLowerCase()
          if (!haystack.includes(term)) return false
        }
        return true
      })
    },
  },
  actions: {
    setFilters(partial: Partial<CatalogueFilters>) {
      this.filters = { ...this.filters, ...partial }
    },
    clearFilters() {
      this.filters = { ...EMPTY_FILTERS }
    },
    /** Live-subscribes to Firestore so manager-panel edits show up within seconds (FR-024). */
    subscribeToCatalogue() {
      this.isLoading = true
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        this.products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product)
        this.isLoading = false
      })
      const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
        this.categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)
      })
      const unsubCollections = onSnapshot(collection(db, 'collections'), (snapshot) => {
        this.collections = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Collection)
      })
      const unsubStyleTags = onSnapshot(collection(db, 'styleTags'), (snapshot) => {
        this.styleTags = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as StyleTag)
      })
      this.unsubscribers = [unsubProducts, unsubCategories, unsubCollections, unsubStyleTags]
    },
    unsubscribeAll() {
      this.unsubscribers.forEach((unsub) => unsub())
      this.unsubscribers = []
    },

    /** Creates a new product (id undefined) or overwrites an existing one. */
    async saveProduct(input: ProductInput, id?: string) {
      const uid = auth.currentUser?.uid ?? 'unknown'
      const now = Date.now()
      if (id) {
        await setDoc(doc(db, 'products', id), { ...input, updatedAt: now, updatedBy: uid }, { merge: true })
        return id
      }
      const created = await addDoc(collection(db, 'products'), {
        ...input,
        createdAt: now,
        updatedAt: now,
        createdBy: uid,
        updatedBy: uid,
      })
      return created.id
    },

    async deleteProduct(id: string) {
      await deleteDoc(doc(db, 'products', id))
    },

    isTaxonomyReferenced(taxonomy: TaxonomyName, id: string): boolean {
      if (taxonomy === 'categories') return this.products.some((p) => p.categoryId === id)
      if (taxonomy === 'collections') return this.products.some((p) => p.collectionId === id)
      return this.products.some((p) => p.styleTagIds.includes(id))
    },

    async addTaxonomyEntry(taxonomy: TaxonomyName, name: string) {
      const existingCount = this[taxonomy].length
      const input: NamedTaxonomyInput = { name, sortOrder: existingCount }
      await addDoc(collection(db, taxonomy), { ...input, createdAt: Date.now() })
    },

    async removeTaxonomyEntry(taxonomy: TaxonomyName, id: string) {
      if (this.isTaxonomyReferenced(taxonomy, id)) {
        throw new Error(`Cannot remove: still referenced by one or more products.`)
      }
      await deleteDoc(doc(db, taxonomy, id))
    },
  },
})
