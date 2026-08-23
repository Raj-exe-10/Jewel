<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import CollectionFilters from '../components/public/CollectionFilters.vue'
import FloatingWhatsAppButton from '../components/public/FloatingWhatsAppButton.vue'
import Footer from '../components/public/Footer.vue'
import Header from '../components/public/Header.vue'
import ProductCard from '../components/public/ProductCard.vue'
import SearchBox from '../components/public/SearchBox.vue'
import SectionHeading from '../components/public/SectionHeading.vue'
import { useCarousel } from '../composables/useCarousel'
import { useBusinessStore } from '../stores/business'
import { useCatalogueStore } from '../stores/catalogue'
import { useWishlistStore } from '../stores/wishlist'
import type { Product } from '../types/catalogue'

const catalogue = useCatalogueStore()
const business = useBusinessStore()
const wishlist = useWishlistStore()

onMounted(() => {
  catalogue.subscribeToCatalogue()
  business.subscribeToProfile()
  wishlist.load()
})

const hasResults = computed(() => catalogue.filteredProducts.length > 0)

/** Duplicate short lists so Embla loop always has enough slides. */
const slides = computed(() => {
  const items = catalogue.filteredProducts
  if (items.length === 0) return [] as { product: Product; key: string }[]
  const source = items.length < 6 ? [...items, ...items] : items
  return source.map((product, index) => ({ product, key: `${product.id}-${index}` }))
})
const slideCount = computed(() => slides.value.length)

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: true, align: 'start', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef

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
      <router-link
        to="/"
        class="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-amore-charcoal transition hover:text-amore-wordmark"
      >
        ← Back to home
      </router-link>

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

        <div v-else class="relative">
          <div class="mb-3 flex justify-end gap-2">
            <button
              type="button"
              aria-label="Previous"
              data-testid="collection-prev"
              class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
              @click="scrollPrev"
            >
              <ChevronLeftIcon class="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              data-testid="collection-next"
              class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
              @click="scrollNext"
            >
              <ChevronRightIcon class="h-4 w-4" />
            </button>
          </div>

          <div ref="emblaRef" class="overflow-hidden" data-testid="collection-carousel">
            <div class="flex">
              <div
                v-for="slide in slides"
                :key="slide.key"
                class="mr-4 min-w-0 flex-[0_0_70%] sm:flex-[0_0_40%] lg:flex-[0_0_28%]"
              >
                <ProductCard
                  :product="slide.product"
                  :category-name="categoryNameFor(slide.product.categoryId)"
                  :business-phone-e164="business.whatsappNumberE164"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer :instagram-handle="business.instagramHandle" :business-phone-e164="business.whatsappNumberE164" />
    <FloatingWhatsAppButton :business-phone-e164="business.whatsappNumberE164" />
  </div>
</template>
