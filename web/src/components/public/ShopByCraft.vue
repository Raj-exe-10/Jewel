<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import SectionHeading from './SectionHeading.vue'

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

const tiles = computed(() =>
  catalogue.collections.map((collectionItem, index) => ({
    id: collectionItem.id,
    name: collectionItem.name,
    image: jewelryImageFor(collectionItem.name, index),
  })),
)
const slideCount = computed(() => tiles.value.length)

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef
</script>

<template>
  <section v-if="tiles.length > 0" class="mx-auto max-w-6xl px-4 py-14">
    <div class="relative mb-2">
      <SectionHeading title="Shop by Craft" subtitle="Kundan, polki, moissanite — choose your craft" icon="❖" />
      <div class="absolute right-0 top-8 z-10 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-craft-prev"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-craft-next"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 shadow-sm transition hover:bg-amore-cream"
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
          class="group relative mr-4 min-w-0 flex-[0_0_60%] overflow-hidden rounded-xl sm:flex-[0_0_35%] lg:flex-[0_0_22%]"
          @click="nav.filterByCollection(tile.id)"
        >
          <img
            :src="tile.image"
            :alt="tile.name"
            class="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <span class="absolute inset-x-0 bottom-3 text-center text-sm font-medium text-white">{{ tile.name }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
