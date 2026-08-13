<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueStore } from '../../stores/catalogue'
import ProductCard from './ProductCard.vue'
import SectionHeading from './SectionHeading.vue'

defineProps<{ businessPhoneE164: string }>()

const catalogue = useCatalogueStore()
const favourites = computed(() => catalogue.products.filter((p) => p.isFounderFavourite))
const slideCount = computed(() => favourites.value.length)

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef
</script>

<template>
  <section v-if="favourites.length > 0" id="founders-favourites" class="mx-auto max-w-6xl px-4 py-14">
    <div class="relative mb-2">
      <SectionHeading
        title="Founder's Favourites"
        subtitle="Signature pieces our atelier returns to again and again"
        icon="◇"
      />
      <div class="absolute right-0 top-8 z-10 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="founders-favourites-prev"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="founders-favourites-next"
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
          v-for="product in favourites"
          :key="product.id"
          class="mr-4 min-w-0 flex-[0_0_70%] sm:flex-[0_0_40%] lg:flex-[0_0_28%]"
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
