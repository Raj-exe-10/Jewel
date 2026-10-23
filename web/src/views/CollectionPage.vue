<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import CollectionFilters from '../components/public/CollectionFilters.vue'
import FloatingWhatsAppButton from '../components/public/FloatingWhatsAppButton.vue'
import Footer from '../components/public/Footer.vue'
import Header from '../components/public/Header.vue'
import CollectionProductRow from '../components/public/CollectionProductRow.vue'
import SearchBox from '../components/public/SearchBox.vue'
import SectionHeading from '../components/public/SectionHeading.vue'
import { useBusinessStore } from '../stores/business'
import { useCatalogueStore } from '../stores/catalogue'
import { useCollectionPageStore } from '../stores/collectionPage'
import { useWishlistStore } from '../stores/wishlist'

const router = useRouter()
const catalogue = useCatalogueStore()
const business = useBusinessStore()
const wishlist = useWishlistStore()
const collectionPage = useCollectionPageStore()

onMounted(() => {
  catalogue.subscribeToCatalogue()
  business.subscribeToProfile()
  wishlist.load()
  collectionPage.subscribeToConfig()
})

/** Prefer real history so Back returns to the previous page (home filters, PDP, etc.). */
function goBack() {
  if (typeof window !== 'undefined' && window.history.state?.back != null) {
    router.back()
    return
  }
  void router.push('/')
}

const hasResults = computed(() => catalogue.filteredProducts.length > 0)

const productRows = computed(() => {
  const rows = []
  const size = collectionPage.productsPerRow
  for (let index = 0; index < catalogue.filteredProducts.length; index += size) {
    rows.push(catalogue.filteredProducts.slice(index, index + size))
  }
  return rows
})

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

useHead({
  title: 'Shop the Collection — Amore',
  meta: [
    {
      name: 'description',
      content: 'Browse the full Amore jewellery catalogue. Filter by category, style, and search.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-amore-theme" data-testid="collection-page">
    <Header :business-phone-e164="business.whatsappNumberE164" />
    <main class="mx-auto max-w-screen-2xl px-4 py-8">
      <button
        type="button"
        data-testid="collection-back-link"
        class="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-amore-charcoal transition hover:text-amore-wordmark"
        @click="goBack"
      >
        ← Back
      </button>

      <SectionHeading
        title="Shop the Collection"
        subtitle="Browse, filter, and enquire on WhatsApp"
        icon="✦"
      />

      <div class="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="order-2 min-w-0 flex-1 lg:order-1">
          <CollectionFilters />
        </div>
        <div class="order-1 w-full shrink-0 lg:order-2 lg:w-72">
          <SearchBox />
        </div>
      </div>

      <div id="collection-products" class="scroll-mt-28 md:scroll-mt-32">
        <p v-if="!hasResults" data-testid="empty-state" class="py-10 text-center text-neutral-500">
          No products found. Try a different category, style, or search term.
        </p>

        <div v-else class="space-y-8">
          <CollectionProductRow
            v-for="products in productRows"
            :key="products.map((product) => product.id).join('-')"
            :products="products"
            :business-phone-e164="business.whatsappNumberE164"
            :category-name-for="categoryNameFor"
          />
        </div>
      </div>
    </main>
    <Footer
      :instagram-handle="business.instagramHandle"
      :business-phone-e164="business.whatsappNumberE164"
    />
    <FloatingWhatsAppButton :business-phone-e164="business.whatsappNumberE164" />
  </div>
</template>
