<script setup lang="ts">
import { computed } from 'vue'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { buildProductEnquiryLink } from '../../composables/useWhatsAppLink'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { coverUrlFromMedia, mediaFromProduct } from '../../lib/productMedia'
import { useWishlistStore } from '../../stores/wishlist'
import type { Product } from '../../types/catalogue'
import WhatsAppIcon from './WhatsAppIcon.vue'

const props = withDefaults(
  defineProps<{
    product: Product
    categoryName: string
    businessPhoneE164: string
    /** Smaller card for related-product carousels. */
    compact?: boolean
    /** Keep the full mobile card, then use compact styling from the sm breakpoint. */
    responsiveCompact?: boolean
    /** Page to return to from the product detail view. */
    detailOrigin?: 'home' | 'collection'
  }>(),
  { compact: false, responsiveCompact: false, detailOrigin: undefined },
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
    class="group relative flex scroll-mt-28 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow duration-300 hover:shadow-lg"
  >
    <button
      type="button"
      data-testid="wishlist-toggle"
      :aria-pressed="isWishlisted"
      class="absolute z-10 rounded-full bg-white/90 shadow transition hover:bg-white"
      :class="
        compact
          ? 'right-1.5 top-1.5 p-1.5'
          : responsiveCompact
            ? 'right-2 top-2 p-2 sm:right-1.5 sm:top-1.5 sm:p-1.5'
            : 'right-2 top-2 p-2'
      "
      :aria-label="isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
      @click.stop="wishlist.toggle(product.id)"
    >
      <component
        :is="isWishlisted ? HeartSolidIcon : HeartOutlineIcon"
        :class="[
          compact ? 'h-3.5 w-3.5' : responsiveCompact ? 'h-4 w-4 sm:h-3.5 sm:w-3.5' : 'h-4 w-4',
          isWishlisted ? 'text-amore-gold' : 'text-neutral-500',
        ]"
      />
    </button>

    <router-link :to="detailTo" data-testid="product-detail-link" class="flex flex-1 flex-col">
      <div class="overflow-hidden">
        <img
          :src="photoUrl"
          :alt="product.name"
          class="w-full object-cover transition duration-500 group-hover:scale-105"
          :class="
            compact
              ? 'aspect-square'
              : responsiveCompact
                ? 'aspect-[3/4] sm:aspect-square'
                : 'aspect-[3/4]'
          "
        />
      </div>

      <div
        class="flex flex-1 flex-col gap-1"
        :class="compact ? 'p-2' : responsiveCompact ? 'p-4 sm:p-2' : 'p-4'"
      >
        <p
          class="uppercase tracking-wide text-neutral-500"
          :class="
            compact
              ? 'text-[10px]'
              : responsiveCompact
                ? 'text-xs sm:text-[10px] lg:text-xs'
                : 'text-xs'
          "
        >
          {{ categoryName }}
        </p>
        <h3
          class="font-display text-neutral-900 group-hover:underline"
          :class="
            compact
              ? 'text-base leading-snug'
              : responsiveCompact
                ? 'text-lg sm:text-base sm:leading-snug lg:text-lg'
                : 'text-lg'
          "
        >
          {{ product.name }}
        </h3>
        <p
          class="text-neutral-600"
          :class="
            compact
              ? 'line-clamp-1 text-xs'
              : responsiveCompact
                ? 'line-clamp-2 text-sm sm:line-clamp-1 sm:text-xs lg:line-clamp-2 lg:text-sm'
                : 'line-clamp-2 text-sm'
          "
        >
          {{ product.description }}
        </p>
        <p
          class="mt-1 font-medium text-neutral-900"
          :class="compact ? 'text-sm' : responsiveCompact ? 'sm:text-sm lg:text-base' : ''"
        >
          {{ formattedPrice }}
        </p>
      </div>
    </router-link>

    <div
      :class="compact ? 'px-2 pb-2' : responsiveCompact ? 'px-4 pb-4 sm:px-2 sm:pb-2' : 'px-4 pb-4'"
    >
      <a
        :href="enquiryLink"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-link"
        class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-whatsapp font-medium text-white transition hover:bg-whatsapp-dark"
        :class="
          compact
            ? 'px-2 py-1.5 text-xs'
            : responsiveCompact
              ? 'px-4 py-2 text-sm sm:px-2 sm:py-1.5 sm:text-xs lg:text-sm'
              : 'px-4 py-2 text-sm'
        "
        @click.stop
      >
        <WhatsAppIcon />
        Enquire on WhatsApp
      </a>
    </div>
  </article>
</template>
