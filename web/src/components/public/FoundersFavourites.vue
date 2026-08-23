<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { productsForSection } from '../../lib/sectionProducts'
import { useCatalogueStore } from '../../stores/catalogue'
import type { Product } from '../../types/catalogue'
import type { HomepageSection } from '../../types/homepage'
import ProductCard from './ProductCard.vue'
import SectionHeading from './SectionHeading.vue'

const props = defineProps<{ businessPhoneE164: string; section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('founders-favourites'))
const favourites = computed(() => productsForSection(resolved.value, catalogue.products))

/** Embla only loops when slides overflow the viewport; duplicate short lists. */
const slides = computed(() => {
  const items = favourites.value
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
</script>

<template>
  <section
    v-if="favourites.length > 0"
    :id="resolved.anchorId"
    class="scroll-mt-28 bg-amore-theme/80 py-8 md:scroll-mt-32"
  >
    <div class="mx-auto max-w-screen-2xl px-4">
      <div class="relative mb-2">
        <SectionHeading
          :title="resolved.title"
          :subtitle="resolved.subtitle"
          :icon="resolved.icon"
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

      <div
        id="founders-favourites-products"
        ref="emblaRef"
        class="scroll-mt-36 overflow-hidden md:scroll-mt-40"
      >
        <div class="flex">
          <div
            v-for="slide in slides"
            :key="slide.key"
            class="mr-4 min-w-0 flex-[0_0_70%] sm:flex-[0_0_32%] lg:flex-[0_0_22%]"
          >
            <ProductCard
              :product="slide.product"
              :category-name="categoryNameFor(slide.product.categoryId)"
              :business-phone-e164="businessPhoneE164"
              responsive-compact
              detail-origin="home"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
