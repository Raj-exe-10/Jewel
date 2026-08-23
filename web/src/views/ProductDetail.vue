<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import FloatingWhatsAppButton from '../components/public/FloatingWhatsAppButton.vue'
import Footer from '../components/public/Footer.vue'
import Header from '../components/public/Header.vue'
import ProductMediaCarousel from '../components/public/ProductMediaCarousel.vue'
import SimilarProductsCarousel from '../components/public/SimilarProductsCarousel.vue'
import WhatsAppIcon from '../components/public/WhatsAppIcon.vue'
import { buildProductEnquiryLink } from '../composables/useWhatsAppLink'
import { mediaFromProduct } from '../lib/productMedia'
import { useBusinessStore } from '../stores/business'
import { useCatalogueStore } from '../stores/catalogue'
import { useWishlistStore } from '../stores/wishlist'

const route = useRoute()
const catalogue = useCatalogueStore()
const business = useBusinessStore()
const wishlist = useWishlistStore()

onMounted(() => {
  catalogue.subscribeToCatalogue()
  business.subscribeToProfile()
  wishlist.load()
})

const product = computed(() => catalogue.products.find((item) => item.id === route.params.id))

const categoryName = computed(
  () =>
    catalogue.categories.find((category) => category.id === product.value?.categoryId)?.name ?? '',
)

const gallery = computed(() => (product.value ? mediaFromProduct(product.value) : []))
const enquiryLink = computed(() =>
  product.value ? buildProductEnquiryLink(product.value, business.whatsappNumberE164) : '#',
)
const isWishlisted = computed(() =>
  product.value ? wishlist.isWishlisted(product.value.id) : false,
)
const backTo = computed(() => (route.query.from === 'home' ? '/' : '/collection'))

const others = computed(() => catalogue.products.filter((item) => item.id !== product.value?.id))

const sameStyleProducts = computed(() => {
  const tags = product.value?.styleTagIds ?? []
  if (tags.length === 0) return []
  return others.value.filter((item) => item.styleTagIds.some((id) => tags.includes(id)))
})

const sameCollectionProducts = computed(() => {
  const collectionId = product.value?.collectionId
  if (!collectionId) return []
  return others.value.filter((item) => item.collectionId === collectionId)
})

const sameCategoryProducts = computed(() => {
  const categoryId = product.value?.categoryId
  if (!categoryId) return []
  return others.value.filter((item) => item.categoryId === categoryId)
})

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

useHead(
  computed(() => ({
    title: product.value ? `${product.value.name} — Amore` : 'Product — Amore',
  })),
)
</script>

<template>
  <div class="min-h-screen bg-amore-theme">
    <Header :business-phone-e164="business.whatsappNumberE164" />
    <main class="mx-auto max-w-screen-2xl px-4 py-6">
      <router-link
        :to="backTo"
        data-testid="product-back-link"
        class="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-amore-charcoal transition hover:text-amore-gold"
      >
        ← Back
      </router-link>

      <div
        v-if="!product"
        class="rounded-sm border border-amore-gold/30 bg-white/70 p-10 text-center text-neutral-600"
      >
        This product is no longer available.
      </div>

      <template v-else>
        <div
          data-testid="product-detail"
          class="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8"
        >
          <ProductMediaCarousel :media="gallery" :product-name="product.name" />

          <div class="relative lg:pt-2">
            <p class="mb-3 text-[11px] uppercase tracking-[0.35em] text-neutral-600">
              {{ categoryName || 'Amore' }}
            </p>
            <h1 class="mb-4 font-display text-4xl leading-tight text-amore-charcoal sm:text-5xl">
              {{ product.name }}
            </h1>
            <p class="mb-6 font-display text-2xl text-amore-charcoal">
              ₹{{ product.priceInr.toLocaleString('en-IN') }}
            </p>
            <p class="mb-8 text-base leading-relaxed text-neutral-700">{{ product.description }}</p>

            <div class="flex flex-wrap gap-3">
              <a
                :href="enquiryLink"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-link"
                class="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-medium text-white transition hover:bg-whatsapp-dark active:scale-[0.98]"
              >
                <WhatsAppIcon />
                Enquire on WhatsApp
              </a>
              <button
                type="button"
                data-testid="wishlist-toggle"
                class="rounded-full border border-amore-gold/50 bg-transparent px-6 py-3 text-sm text-amore-charcoal transition hover:bg-amore-gold/10 active:scale-[0.98]"
                @click="wishlist.toggle(product.id)"
              >
                {{ isWishlisted ? 'Remove from wishlist' : 'Add to wishlist' }}
              </button>
            </div>

            <p class="mt-8 text-[11px] uppercase tracking-[0.3em] text-neutral-400">
              Handcrafted · Heritage · Amore
            </p>
          </div>
        </div>

        <SimilarProductsCarousel
          title="Explore more in this style"
          :products="sameStyleProducts"
          :business-phone-e164="business.whatsappNumberE164"
          :category-name-for="categoryNameFor"
        />
        <SimilarProductsCarousel
          title="Explore more from this collection"
          :products="sameCollectionProducts"
          :business-phone-e164="business.whatsappNumberE164"
          :category-name-for="categoryNameFor"
        />
        <SimilarProductsCarousel
          title="Explore more in this category"
          :products="sameCategoryProducts"
          :business-phone-e164="business.whatsappNumberE164"
          :category-name-for="categoryNameFor"
        />
      </template>
    </main>
    <Footer
      :instagram-handle="business.instagramHandle"
      :business-phone-e164="business.whatsappNumberE164"
    />
    <FloatingWhatsAppButton :business-phone-e164="business.whatsappNumberE164" />
  </div>
</template>
