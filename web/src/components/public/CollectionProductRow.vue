<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import type { Product } from '../../types/catalogue'
import ProductCard from './ProductCard.vue'

const props = defineProps<{
  products: Product[]
  businessPhoneE164: string
  categoryNameFor: (categoryId: string) => string
}>()

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: false, align: 'start', slidesToScroll: 1 },
  [],
  computed(() => props.products.length),
)
void emblaRef
</script>

<template>
  <section
    class="relative"
    data-testid="collection-product-row"
    :data-product-count="products.length"
  >
    <div class="mb-3 flex justify-end gap-2">
      <button
        type="button"
        aria-label="Previous"
        class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
        @click="scrollPrev"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next"
        class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
        @click="scrollNext"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>
    </div>

    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex">
        <div
          v-for="product in products"
          :key="product.id"
          class="mr-4 min-w-0 flex-[0_0_70%] sm:flex-[0_0_32%] lg:flex-[0_0_22%]"
        >
          <ProductCard
            :product="product"
            :category-name="categoryNameFor(product.categoryId)"
            :business-phone-e164="businessPhoneE164"
            responsive-compact
            detail-origin="collection"
          />
        </div>
      </div>
    </div>
  </section>
</template>
