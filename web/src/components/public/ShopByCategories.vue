<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection, TaxonomyTilesContent } from '../../types/homepage'
import SectionHeading from './SectionHeading.vue'

const props = defineProps<{ section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('shop-by-categories'))
const overrides = computed(() => (resolved.value.content as TaxonomyTilesContent).tileImageOverrides ?? {})

const tiles = computed(() =>
  catalogue.categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    image: overrides.value[category.id] ?? jewelryImageFor(category.name, index),
  })),
)
const slideCount = computed(() => tiles.value.length)

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: true, align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef
</script>

<template>
  <section v-if="tiles.length > 0" :id="resolved.anchorId" class="mx-auto max-w-screen-2xl px-4 py-8">
    <div class="relative mb-2">
      <SectionHeading :title="resolved.title" :subtitle="resolved.subtitle" :icon="resolved.icon" />
      <div class="absolute right-0 top-8 z-10 hidden items-center gap-2 sm:flex">
        <button
          type="button"
          data-testid="shop-categories-view-all"
          class="mr-2 text-sm font-medium text-amore-gold underline-offset-4 hover:underline"
          @click="nav.clearAndScrollToCatalogue"
        >
          View All
        </button>
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-categories-prev"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-theme"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-categories-next"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-theme"
          @click.stop="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex">
        <button
          v-for="tile in tiles"
          :key="tile.id"
          type="button"
          data-testid="category-tile"
          class="group mr-4 flex min-w-0 flex-[0_0_40%] flex-col items-center gap-2 sm:flex-[0_0_28%] lg:flex-[0_0_16%]"
          @click="nav.filterByCategory(tile.id)"
        >
          <span class="block aspect-square w-full overflow-hidden rounded-2xl bg-amore-theme">
            <img
              :src="tile.image"
              :alt="tile.name"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </span>
          <span class="text-xs font-medium tracking-wide text-neutral-700 sm:text-sm">{{ tile.name }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
