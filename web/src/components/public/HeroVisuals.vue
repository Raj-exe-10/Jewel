<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { useCatalogueStore } from '../../stores/catalogue'
import type { Product } from '../../types/catalogue'

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

function firstPhotoFor(predicate: (p: Product) => boolean, seed: string): string {
  const match = catalogue.products.find(predicate)
  return match?.photoUrls[0] ?? `https://picsum.photos/seed/amore-visual-${seed}/500/650`
}

const tiles = computed(() => {
  const categoryTiles = catalogue.categories.map((category) => ({
    id: `category-${category.id}`,
    label: category.name,
    image: firstPhotoFor((p) => p.categoryId === category.id, category.id),
    onClick: () => nav.filterByCategory(category.id),
  }))

  const collectionTiles = catalogue.collections.map((collectionItem) => ({
    id: `collection-${collectionItem.id}`,
    label: collectionItem.name,
    image: firstPhotoFor((p) => p.collectionId === collectionItem.id, collectionItem.id),
    onClick: () => nav.filterByCollection(collectionItem.id),
  }))

  return [...categoryTiles, ...collectionTiles]
})

const { emblaRef, scrollPrev, scrollNext } = useCarousel({ align: 'start', dragFree: true })
// Bound via the plain `ref="emblaRef"` template attribute below; vue-tsc's
// unused-locals check can't see that indirect usage.
void emblaRef
</script>

<template>
  <section id="shop-the-visuals" class="mx-auto max-w-6xl px-4 pt-14">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-display text-2xl">Shop the Visuals</h2>
      <div class="hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-visuals-prev"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-visuals-next"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <p v-if="tiles.length === 0" class="text-sm text-neutral-500">Categories coming soon.</p>
    <div v-else ref="emblaRef" class="overflow-hidden">
      <div class="flex gap-4">
        <button
          v-for="tile in tiles"
          :key="tile.id"
          type="button"
          data-testid="shop-visuals-tile"
          class="group relative min-w-0 flex-[0_0_44%] overflow-hidden rounded-full sm:flex-[0_0_22%] lg:flex-[0_0_15%]"
          @click="tile.onClick"
        >
          <img
            :src="tile.image"
            :alt="tile.label"
            class="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span class="absolute inset-0 rounded-full bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <span class="absolute inset-x-0 bottom-3 text-center text-xs font-medium text-white drop-shadow sm:text-sm">
            {{ tile.label }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
