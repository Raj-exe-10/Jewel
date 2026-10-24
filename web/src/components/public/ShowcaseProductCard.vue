<script setup lang="ts">
import { computed } from 'vue'
import {
  EyeIcon,
  HeartIcon as HeartOutlineIcon,
  ShoppingBagIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { buildProductEnquiryLink } from '../../composables/useWhatsAppLink'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { coverUrlFromMedia, mediaFromProduct } from '../../lib/productMedia'
import { useWishlistStore } from '../../stores/wishlist'
import type { Product } from '../../types/catalogue'

const props = withDefaults(
  defineProps<{
    product: Product
    categoryName: string
    businessPhoneE164: string
    detailOrigin?: 'home' | 'collection'
  }>(),
  { detailOrigin: 'home' },
)

const wishlist = useWishlistStore()
const isWishlisted = computed(() => wishlist.isWishlisted(props.product.id))
const enquiryLink = computed(() => buildProductEnquiryLink(props.product, props.businessPhoneE164))
const formattedPrice = computed(() => `₹${props.product.priceInr.toLocaleString('en-IN')}`)
const photoUrl = computed(() => {
  const fromMedia = coverUrlFromMedia(mediaFromProduct(props.product))
  const url = fromMedia || props.product.photoUrls[0]
  if (!url || url.includes('picsum.photos')) {
    return jewelryImageFor(props.categoryName || props.product.name)
  }
  return url
})
const detailTo = computed(() => {
  const path = `/product/${props.product.id}`
  return props.detailOrigin ? `${path}?from=${props.detailOrigin}` : path
})
</script>

<template>
  <article
    :id="`product-${product.id}`"
    data-testid="product-card"
    class="amore-category-card group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-amore-burgundy/10 bg-[#f3ebe3] px-5 pb-5 pt-5 shadow-[0_14px_36px_-24px_rgba(61,10,20,0.45)]"
  >
    <div class="relative z-10 mb-1 flex items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">Categories</p>
        <h3 class="mt-0.5 font-display text-xl leading-snug text-amore-charcoal sm:text-[1.35rem]">
          <router-link
            :to="detailTo"
            data-testid="product-detail-link"
            class="transition hover:text-amore-burgundy"
          >
            {{ product.name }}
          </router-link>
        </h3>
      </div>

      <div class="flex shrink-0 flex-col gap-1.5">
        <button
          type="button"
          data-testid="wishlist-toggle"
          :aria-pressed="isWishlisted"
          class="rounded-full bg-white/90 p-1.5 text-neutral-500 shadow-sm transition hover:text-amore-gold"
          :aria-label="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
          @click.stop="wishlist.toggle(product.id)"
        >
          <component
            :is="isWishlisted ? HeartSolidIcon : HeartOutlineIcon"
            :class="['h-3.5 w-3.5', isWishlisted ? 'text-amore-gold' : '']"
          />
        </button>
        <router-link
          :to="detailTo"
          aria-label="Quick view"
          class="rounded-full bg-white/90 p-1.5 text-neutral-500 shadow-sm transition hover:text-amore-burgundy"
          @click.stop
        >
          <EyeIcon class="h-3.5 w-3.5" />
        </router-link>
      </div>
    </div>

    <div class="relative z-10 mt-2 flex flex-wrap gap-1.5">
      <span
        v-if="product.isNewArrival"
        class="bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amore-charcoal shadow-sm"
      >
        New
      </span>
      <span
        v-if="product.isBridal || product.isStatementPick"
        class="bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amore-charcoal shadow-sm"
      >
        Sale
      </span>
    </div>

    <router-link :to="detailTo" class="relative z-10 mx-auto flex flex-1 items-center justify-center py-5">
      <img
        :src="photoUrl"
        :alt="product.name"
        class="max-h-44 w-auto max-w-[88%] object-contain transition duration-500 group-hover:scale-105 sm:aspect-square sm:max-h-52 sm:object-contain"
      />
    </router-link>

    <div class="relative z-10 mt-auto">
      <p class="font-display text-lg font-semibold text-amore-charcoal">{{ formattedPrice }}</p>
    </div>

    <a
      :href="enquiryLink"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-link"
      class="relative z-10 mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amore-maroon px-4 py-2.5 text-sm font-medium text-amore-cream transition hover:bg-amore-burgundy"
      @click.stop
    >
      <ShoppingBagIcon class="h-4 w-4" />
      Add To Cart
    </a>
  </article>
</template>
