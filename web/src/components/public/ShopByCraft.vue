<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

const tiles = computed(() =>
  catalogue.collections.map((collectionItem) => {
    const match = catalogue.products.find((p) => p.collectionId === collectionItem.id)
    return {
      id: collectionItem.id,
      name: collectionItem.name,
      image: match?.photoUrls[0] ?? `https://picsum.photos/seed/amore-craft-${collectionItem.id}/500/650`,
    }
  }),
)

const { emblaRef, scrollPrev, scrollNext } = useCarousel({ align: 'start', dragFree: true })
// Bound via the plain `ref="emblaRef"` template attribute below; vue-tsc's
// unused-locals check can't see that indirect usage.
void emblaRef
</script>

<template>
  <section v-if="tiles.length > 0" class="mx-auto max-w-6xl px-4 py-14">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-display text-2xl">Shop by Craft</h2>
      <div class="hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-craft-prev"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-craft-next"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex gap-4">
        <button
          v-for="tile in tiles"
          :key="tile.id"
          type="button"
          data-testid="craft-tile"
          class="group relative min-w-0 flex-[0_0_55%] overflow-hidden rounded-xl sm:flex-[0_0_28%] lg:flex-[0_0_18%]"
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
