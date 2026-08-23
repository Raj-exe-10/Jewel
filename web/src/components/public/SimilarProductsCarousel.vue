<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import type { Product } from '../../types/catalogue'
import ProductCard from './ProductCard.vue'

const props = defineProps<{
  title: string
  products: Product[]
  businessPhoneE164: string
  categoryNameFor: (categoryId: string) => string
}>()

const slides = computed(() => {
  const items = props.products
  if (items.length === 0) return [] as { product: Product; key: string }[]
  const source = items.length < 6 ? [...items, ...items] : items
  return source.map((product, index) => ({ product, key: `${product.id}-${index}` }))
})
const slideCount = computed(() => slides.value.length)

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: true, align: 'start', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef
</script>

<template>
  <section
    v-if="products.length > 0"
    class="mt-12 border-b border-neutral-200 pb-10"
    data-testid="similar-products-row"
  >
    <div class="relative mb-4 flex items-center justify-between gap-4">
      <h2 class="font-display text-xl text-amore-header sm:text-2xl">
        <span class="mr-2" aria-hidden="true">◆</span>{{ title }}
      </h2>
      <div class="hidden shrink-0 gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
          @click.stop="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex">
        <div
          v-for="slide in slides"
          :key="slide.key"
          class="mr-3 min-w-0 flex-[0_0_45%] sm:flex-[0_0_30%] lg:flex-[0_0_20%]"
        >
          <ProductCard
            compact
            :product="slide.product"
            :category-name="categoryNameFor(slide.product.categoryId)"
            :business-phone-e164="businessPhoneE164"
          />
        </div>
      </div>
    </div>
  </section>
</template>
