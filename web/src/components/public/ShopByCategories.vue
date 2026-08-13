<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import SectionHeading from './SectionHeading.vue'

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

const tiles = computed(() =>
  catalogue.categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    image: jewelryImageFor(category.name, index),
  })),
)
</script>

<template>
  <section v-if="tiles.length > 0" class="mx-auto max-w-6xl px-4 py-14">
    <div class="relative mb-2">
      <SectionHeading title="Shop by Categories" subtitle="Browse every silhouette in the Amore atelier" icon="◈" />
      <button
        type="button"
        data-testid="shop-categories-view-all"
        class="absolute right-0 top-1/2 hidden -translate-y-1/2 text-sm font-medium text-amore-gold underline-offset-4 hover:underline sm:block"
        @click="nav.clearAndScrollToCatalogue"
      >
        View All
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      <button
        v-for="tile in tiles"
        :key="tile.id"
        type="button"
        data-testid="category-tile"
        class="group flex flex-col items-center gap-2"
        @click="nav.filterByCategory(tile.id)"
      >
        <span class="block aspect-square w-full overflow-hidden rounded-2xl bg-amore-cream">
          <img
            :src="tile.image"
            :alt="tile.name"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </span>
        <span class="text-xs font-medium tracking-wide text-neutral-700 sm:text-sm">{{ tile.name }}</span>
      </button>
    </div>
  </section>
</template>
