<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { cataloguePreview } from '../../lib/cataloguePreview'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection } from '../../types/homepage'
import ProductCard from './ProductCard.vue'
import SectionHeading from './SectionHeading.vue'

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
  <section :id="resolved.anchorId || 'catalogue'" class="mx-auto max-w-screen-2xl px-4 py-8">
    <div class="relative mb-2">
      <button
        type="button"
        data-testid="catalogue-heading-link"
        class="w-full cursor-pointer rounded-sm text-left transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amore-header"
        @click="onHeadingClick"
      >
        <SectionHeading
          :title="resolved.title"
          :subtitle="resolved.subtitle"
          :icon="resolved.icon"
        />
      </button>
      <div class="absolute right-0 top-8 z-10 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="catalogue-prev"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-theme"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="catalogue-next"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-theme"
          @click.stop="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <p
      v-if="previewProducts.length === 0"
      data-testid="empty-state"
      class="py-10 text-center text-neutral-500"
    >
      No products available yet.
    </p>

    <template v-else>
      <div ref="emblaRef" class="overflow-hidden">
        <div class="flex">
          <div
            v-for="product in previewProducts"
            :key="product.id"
            class="mr-4 min-w-0 flex-[0_0_70%] sm:flex-[0_0_32%] lg:flex-[0_0_22%]"
          >
            <ProductCard
              :product="product"
              :category-name="categoryNameFor(product.categoryId)"
              :business-phone-e164="businessPhoneE164"
              responsive-compact
              detail-origin="home"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-center">
        <router-link
          to="/collection"
          data-testid="catalogue-view-more"
          class="rounded-full border border-amore-wordmark/50 bg-amore-header px-8 py-3 text-sm font-medium tracking-wide text-amore-cream transition hover:bg-amore-header/90"
        >
          View More
        </router-link>
      </div>
    </template>
  </section>
</template>
