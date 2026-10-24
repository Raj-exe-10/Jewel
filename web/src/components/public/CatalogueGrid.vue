<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { cataloguePreview } from '../../lib/cataloguePreview'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection } from '../../types/homepage'
import LuxuryDarkBand from './LuxuryDarkBand.vue'
import ProductCard from './ProductCard.vue'

const props = defineProps<{ businessPhoneE164: string; section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('catalogue'))
const previewProducts = computed(() => cataloguePreview(catalogue.products))
const slideCount = computed(() => previewProducts.value.length)

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

function onHeadingClick() {
  void nav.openCollectionPage()
}

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: true, align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef
</script>

<template>
  <LuxuryDarkBand :id="resolved.anchorId || 'catalogue'">
    <div class="relative mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <button
        type="button"
        data-testid="catalogue-heading-link"
        class="max-w-xl cursor-pointer rounded-sm text-left transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amore-gold"
        @click="onHeadingClick"
      >
        <p class="mb-2 text-xs uppercase tracking-[0.35em] text-amore-gold">Collection</p>
        <h2 class="font-display text-3xl text-amore-cream sm:text-4xl">
          {{ resolved.title || 'Find the perfect Diamond for' }}
        </h2>
        <p v-if="resolved.subtitle" class="mt-2 text-sm text-amore-cream/70">{{ resolved.subtitle }}</p>
      </button>

      <div class="flex gap-2">
        <button
          type="button"
          aria-label="Previous"
          data-testid="catalogue-prev"
          class="border border-amore-cream/30 p-1.5 text-amore-cream transition hover:border-amore-gold hover:text-amore-gold"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="catalogue-next"
          class="border border-amore-cream/30 p-1.5 text-amore-cream transition hover:border-amore-gold hover:text-amore-gold"
          @click.stop="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <p
      v-if="previewProducts.length === 0"
      data-testid="empty-state"
      class="py-10 text-center text-amore-cream/60"
    >
      No products available yet.
    </p>

    <template v-else>
      <div ref="emblaRef" class="overflow-hidden">
        <div class="flex">
          <div
            v-for="product in previewProducts"
            :key="product.id"
            class="mr-4 min-w-0 flex-[0_0_78%] sm:flex-[0_0_42%] lg:flex-[0_0_23%]"
          >
            <ProductCard
              :product="product"
              :category-name="categoryNameFor(product.categoryId)"
              :business-phone-e164="businessPhoneE164"
              responsive-compact
              detail-origin="home"
              cta-label="Add To Cart"
            />
          </div>
        </div>
      </div>

      <div class="mt-10 flex justify-center">
        <router-link
          to="/collection"
          data-testid="catalogue-view-more"
          class="border border-amore-gold/50 bg-transparent px-8 py-3 text-sm font-medium tracking-wide text-amore-cream transition hover:bg-amore-gold hover:text-amore-maroon"
        >
          View More
        </router-link>
      </div>
    </template>
  </LuxuryDarkBand>
</template>
