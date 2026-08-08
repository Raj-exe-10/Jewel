<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

const tiles = computed(() =>
  catalogue.categories.map((category) => {
    const match = catalogue.products.find((p) => p.categoryId === category.id)
    return {
      id: category.id,
      name: category.name,
      image: match?.photoUrls[0] ?? `https://picsum.photos/seed/amore-category-${category.id}/400/400`,
    }
  }),
)
</script>

<template>
  <section v-if="tiles.length > 0" class="mx-auto max-w-6xl px-4 py-14">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-display text-2xl">Shop by Categories</h2>
      <button
        type="button"
        data-testid="shop-categories-view-all"
        class="text-sm font-medium text-amore-charcoal underline-offset-4 hover:underline"
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
