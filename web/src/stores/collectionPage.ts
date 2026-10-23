import { defineStore } from 'pinia'
import { getCurrentUid, supabase } from '../supabase/client'

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
    channelName: null as string | null,
  }),
  actions: {
    async refreshConfig() {
      const { data, error } = await supabase
        .from('catalogue_config')
        .select('products_per_row')
        .eq('id', 'collection_page')
        .maybeSingle()
      if (error) throw error
      const value = data?.products_per_row
      this.productsPerRow = isValidProductsPerRow(value) ? value : DEFAULT_PRODUCTS_PER_ROW
      this.isLoading = false
    },

    subscribeToConfig() {
      if (this.channelName) {
        for (const channel of supabase.getChannels()) {
          if (channel.topic.includes(this.channelName)) void supabase.removeChannel(channel)
        }
        this.channelName = null
      }
      this.isLoading = true
      void this.refreshConfig().catch(() => {
        this.isLoading = false
      })
      this.channelName = 'catalogue-config'
      supabase
        .channel(this.channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'catalogue_config', filter: 'id=eq.collection_page' },
          () => {
            void this.refreshConfig()
          },
        )
        .subscribe()
    },

    async saveProductsPerRow(value: number) {
      if (!isValidProductsPerRow(value)) {
        throw new Error(
          `Products per row must be between ${MIN_PRODUCTS_PER_ROW} and ${MAX_PRODUCTS_PER_ROW}.`,
        )
      }
      const uid = await getCurrentUid()
      const { error } = await supabase.from('catalogue_config').upsert({
        id: 'collection_page',
        products_per_row: value,
        updated_at: Date.now(),
        updated_by: uid,
      })
      if (error) throw error
      this.productsPerRow = value
    },
  },
})
