import { defineStore } from 'pinia'
import { normalizeTaxonomyName, planTaxonomyCollapse } from '../lib/taxonomyDuplicates'
import { getCurrentUid, supabase } from '../supabase/client'
import {
  TAXONOMY_TABLE,
  PRODUCT_SELECT,
  mapProduct,
  mapTaxonomy,
  productInputToRow,
} from '../supabase/mappers'
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
  channelNames: string[]
}

async function replaceProductStyleTags(productId: string, styleTagIds: string[]) {
  const { error: delError } = await supabase.from('product_style_tags').delete().eq('product_id', productId)
  if (delError) throw delError
  if (styleTagIds.length === 0) return
  const { error } = await supabase.from('product_style_tags').insert(
    styleTagIds.map((style_tag_id) => ({ product_id: productId, style_tag_id })),
  )
  if (error) throw error
}

export const useCatalogueStore = defineStore('catalogue', {
  state: (): CatalogueState => ({
    products: [],
    categories: [],
    collections: [],
    styleTags: [],
    filters: { ...EMPTY_FILTERS },
    isLoading: false,
    channelNames: [],
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
          const categoryName =
            state.categories.find((c) => c.id === product.categoryId)?.name.toLowerCase() ?? ''
          const collectionName =
            state.collections.find((c) => c.id === product.collectionId)?.name.toLowerCase() ?? ''
          const styleNames = product.styleTagIds
            .map((id) => state.styleTags.find((t) => t.id === id)?.name.toLowerCase() ?? '')
            .join(' ')
          const haystack =
            `${product.name} ${product.description} ${categoryName} ${collectionName} ${styleNames}`.toLowerCase()
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
    replaceFilters(partial: Partial<CatalogueFilters>) {
      this.filters = { ...EMPTY_FILTERS, ...partial }
    },
    clearFilters() {
      this.filters = { ...EMPTY_FILTERS }
    },

    async refreshCatalogue() {
      let lastError: unknown
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const [productsRes, categoriesRes, collectionsRes, styleTagsRes] = await Promise.all([
            supabase.from('products').select(PRODUCT_SELECT),
            supabase.from('categories').select('*'),
            supabase.from('collections').select('*'),
            supabase.from('style_tags').select('*'),
          ])
          if (productsRes.error) throw productsRes.error
          if (categoriesRes.error) throw categoriesRes.error
          if (collectionsRes.error) throw collectionsRes.error
          if (styleTagsRes.error) throw styleTagsRes.error

          this.products = (productsRes.data ?? []).map((row) => mapProduct(row as never))
          this.categories = (categoriesRes.data ?? []).map((row) => mapTaxonomy(row as never) as Category)
          this.collections = (collectionsRes.data ?? []).map((row) => mapTaxonomy(row as never) as Collection)
          this.styleTags = (styleTagsRes.data ?? []).map((row) => mapTaxonomy(row as never) as StyleTag)
          this.isLoading = false
          return
        } catch (error) {
          lastError = error
          if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
        }
      }
      this.isLoading = false
      throw lastError
    },

    /** Live-subscribes so manager-panel edits show up within seconds (FR-024). */
    subscribeToCatalogue() {
      this.isLoading = true
      void this.refreshCatalogue().catch(() => {
        this.isLoading = false
      })

      // Re-entry (e.g. Collection → ProductDetail → Collection) must not call `.on()` on an
      // already-subscribed Realtime channel — supabase-js throws after `subscribe()`.
      if (this.channelNames.length > 0) return

      const tables = ['products', 'categories', 'collections', 'style_tags', 'product_style_tags'] as const
      this.channelNames = tables.map((table) => {
        const name = `catalogue-${table}`
        supabase
          .channel(name)
          .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
            void this.refreshCatalogue()
          })
          .subscribe()
        return name
      })
    },


    unsubscribeAll() {
      for (const channel of supabase.getChannels()) {
        if (this.channelNames.includes(channel.topic.replace(/^realtime:/, '')) || this.channelNames.some((n) => channel.topic.includes(n))) {
          void supabase.removeChannel(channel)
        }
      }
      this.channelNames = []
    },

    async saveProduct(input: ProductInput, id?: string) {
      const uid = await getCurrentUid()
      const now = Date.now()
      const row = productInputToRow(input, uid, now, id ? ({ id } as Product) : undefined)

      if (id) {
        const { error } = await supabase.from('products').update(row).eq('id', id)
        if (error) throw error
        await replaceProductStyleTags(id, input.styleTagIds)
        return id
      }

      const { data, error } = await supabase.from('products').insert(row).select('id').single()
      if (error) throw error
      const newId = data.id as string
      await replaceProductStyleTags(newId, input.styleTagIds)
      return newId
    },

    async deleteProduct(id: string) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },

    isTaxonomyReferenced(taxonomy: TaxonomyName, id: string): boolean {
      if (taxonomy === 'categories') return this.products.some((p) => p.categoryId === id)
      if (taxonomy === 'collections') return this.products.some((p) => p.collectionId === id)
      return this.products.some((p) => p.styleTagIds.includes(id))
    },

    async addTaxonomyEntry(taxonomy: TaxonomyName, name: string) {
      const trimmed = name.trim()
      const normalized = normalizeTaxonomyName(trimmed)
      if (this[taxonomy].some((item) => normalizeTaxonomyName(item.name) === normalized)) {
        throw new Error(`A ${taxonomy} entry named "${trimmed}" already exists.`)
      }
      const existingCount = this[taxonomy].length
      const input: NamedTaxonomyInput = { name: trimmed, sortOrder: existingCount }
      const table = TAXONOMY_TABLE[taxonomy]
      const { error } = await supabase.from(table).insert({
        name: input.name,
        sort_order: input.sortOrder,
        created_at: Date.now(),
      })
      if (error) throw error
    },

    async removeTaxonomyEntry(taxonomy: TaxonomyName, id: string) {
      if (this.isTaxonomyReferenced(taxonomy, id)) {
        throw new Error(`Cannot remove: still referenced by one or more products.`)
      }
      const table = TAXONOMY_TABLE[taxonomy]
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },

    async collapseDuplicateTaxonomies() {
      const plan = planTaxonomyCollapse({
        categories: this.categories,
        collections: this.collections,
        styleTags: this.styleTags,
        products: this.products,
      })
      if (plan.deleteIds.length === 0 && plan.productUpdates.length === 0) return

      const uid = await getCurrentUid()
      const now = Date.now()
      await Promise.all(
        plan.productUpdates.map(async (update) => {
          const { error } = await supabase
            .from('products')
            .update({
              category_id: update.categoryId,
              collection_id: update.collectionId,
              updated_at: now,
              updated_by: uid,
            })
            .eq('id', update.id)
          if (error) throw error
          await replaceProductStyleTags(update.id, update.styleTagIds)
        }),
      )
      await Promise.all(
        plan.deleteIds.map(async (entry) => {
          const table = TAXONOMY_TABLE[entry.taxonomy]
          const { error } = await supabase.from(table).delete().eq('id', entry.id)
          if (error) throw error
        }),
      )
    },
  },
})
