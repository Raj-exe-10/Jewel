<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection, TaxonomyTilesContent } from '../../types/homepage'
import LuxuryDarkBand from './LuxuryDarkBand.vue'

const props = defineProps<{ section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('shop-by-craft'))
const overrides = computed(() => (resolved.value.content as TaxonomyTilesContent).tileImageOverrides ?? {})

const tiles = computed(() =>
  catalogue.collections.map((collectionItem, index) => ({
    id: collectionItem.id,
    name: collectionItem.name,
    image: overrides.value[collectionItem.id] ?? jewelryImageFor(collectionItem.name, index),
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
  <LuxuryDarkBand v-if="tiles.length > 0" :id="resolved.anchorId">
    <div class="mb-8 flex items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-xs uppercase tracking-[0.35em] text-amore-gold">Discover</p>
        <h2 class="font-display text-3xl text-amore-cream sm:text-4xl">
          {{ resolved.title || 'Discover the Ruby Jewellery' }}
        </h2>
        <p v-if="resolved.subtitle" class="mt-2 max-w-lg text-sm text-amore-cream/70">
          {{ resolved.subtitle }}
        </p>
      </div>
      <div class="hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-craft-prev"
          class="border border-amore-cream/30 p-1.5 text-amore-cream transition hover:border-amore-gold hover:text-amore-gold"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-craft-next"
          class="border border-amore-cream/30 p-1.5 text-amore-cream transition hover:border-amore-gold hover:text-amore-gold"
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
          data-testid="craft-tile"
          class="group mr-4 flex min-w-0 flex-[0_0_78%] flex-col border border-amore-cream/10 bg-amore-cream text-left sm:flex-[0_0_42%] lg:flex-[0_0_23%]"
          @click="nav.filterByCollection(tile.id)"
        >
          <div class="aspect-[4/5] overflow-hidden bg-amore-blush">
            <img
              :src="tile.image"
              :alt="tile.name"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div class="flex flex-1 flex-col gap-3 p-4">
            <h3 class="font-display text-xl text-amore-charcoal">{{ tile.name }}</h3>
            <span
              class="mt-auto inline-flex w-full items-center justify-center bg-amore-maroon px-3 py-2.5 text-xs font-medium tracking-wide text-amore-cream transition group-hover:bg-amore-burgundy"
            >
              Explore Craft →
            </span>
          </div>
        </button>
      </div>
    </div>
  </LuxuryDarkBand>
</template>
