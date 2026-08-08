<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueStore } from '../../stores/catalogue'
import ProductCard from './ProductCard.vue'

defineProps<{ businessPhoneE164: string }>()

const catalogue = useCatalogueStore()
const favourites = computed(() => catalogue.products.filter((p) => p.isFounderFavourite))

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

const { emblaRef, scrollPrev, scrollNext } = useCarousel({ align: 'start', dragFree: true })
// Bound via the plain `ref="emblaRef"` template attribute below; vue-tsc's
// unused-locals check can't see that indirect usage.
void emblaRef
</script>

<template>
  <section v-if="favourites.length > 0" id="founders-favourites" class="mx-auto max-w-6xl px-4 py-14">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-display text-2xl">Founder's Favourites</h2>
      <div class="hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="founders-favourites-prev"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="founders-favourites-next"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex gap-4">
        <div
          v-for="product in favourites"
          :key="product.id"
          class="min-w-0 flex-[0_0_70%] sm:flex-[0_0_32%] lg:flex-[0_0_23%]"
        >
          <ProductCard
            :product="product"
            :category-name="categoryNameFor(product.categoryId)"
            :business-phone-e164="businessPhoneE164"
          />
        </div>
      </div>
    </div>
  </section>
</template>
