<script setup lang="ts">
import { computed } from 'vue'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { buildProductEnquiryLink } from '../../composables/useWhatsAppLink'
import { useWishlistStore } from '../../stores/wishlist'
import type { Product } from '../../types/catalogue'

const props = defineProps<{
  product: Product
  categoryName: string
  businessPhoneE164: string
}>()

const wishlist = useWishlistStore()
const isWishlisted = computed(() => wishlist.isWishlisted(props.product.id))
const enquiryLink = computed(() => buildProductEnquiryLink(props.product, props.businessPhoneE164))
const formattedPrice = computed(() => `₹${props.product.priceInr.toLocaleString('en-IN')}`)
</script>

<template>
  <article
    data-testid="product-card"
    class="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow duration-300 hover:shadow-lg"
  >
    <button
      type="button"
      data-testid="wishlist-toggle"
      :aria-pressed="isWishlisted"
      class="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow transition hover:bg-white"
      :aria-label="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
      @click="wishlist.toggle(product.id)"
    >
      <component
        :is="isWishlisted ? HeartSolidIcon : HeartOutlineIcon"
        class="h-4 w-4"
        :class="isWishlisted ? 'text-amore-gold' : 'text-neutral-500'"
      />
    </button>

    <div class="overflow-hidden">
      <img
        :src="product.photoUrls[0]"
        :alt="product.name"
        class="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
      />
    </div>

    <div class="flex flex-1 flex-col gap-1 p-4">
      <p class="text-xs uppercase tracking-wide text-neutral-500">{{ categoryName }}</p>
      <h3 class="font-display text-lg text-neutral-900">{{ product.name }}</h3>
      <p class="line-clamp-2 text-sm text-neutral-600">{{ product.description }}</p>
      <p class="mt-1 font-medium text-neutral-900">{{ formattedPrice }}</p>

      <a
        :href="enquiryLink"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-link"
        class="mt-3 inline-flex items-center justify-center rounded-md bg-amore-charcoal px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
      >
        Enquire on WhatsApp
      </a>
    </div>
  </article>
</template>
