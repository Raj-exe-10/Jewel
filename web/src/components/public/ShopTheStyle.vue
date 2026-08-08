<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

const styleCards = computed(() =>
  catalogue.styleTags.map((tag) => {
    const match = catalogue.products.find((p) => p.styleTagIds.includes(tag.id))
    return {
      id: tag.id,
      name: tag.name,
      image: match?.photoUrls[0] ?? `https://picsum.photos/seed/amore-style-${tag.id}/500/650`,
    }
  }),
)

const { emblaRef, scrollPrev, scrollNext } = useCarousel({ align: 'start', dragFree: true })
// Bound via the plain `ref="emblaRef"` template attribute below; vue-tsc's
// unused-locals check can't see that indirect usage.
void emblaRef
</script>

<template>
  <section v-if="styleCards.length > 0" class="mx-auto max-w-6xl px-4 py-14">
    <div class="mb-1 flex items-center justify-between">
      <h2 class="font-display text-2xl">Shop the Style</h2>
      <div class="hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-style-prev"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-style-next"
          class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-neutral-100"
          @click="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
    <p class="mb-6 text-sm text-neutral-500">Find your piece by occasion or style</p>

    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex gap-4">
        <button
          v-for="card in styleCards"
          :key="card.id"
          type="button"
          data-testid="style-tag-card"
          class="group relative min-w-0 flex-[0_0_60%] overflow-hidden rounded-xl sm:flex-[0_0_30%] lg:flex-[0_0_23%]"
          @click="nav.filterByStyleTag(card.id)"
        >
          <img
            :src="card.image"
            :alt="card.name"
            class="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span class="absolute inset-x-0 bottom-4 text-center font-display text-lg text-white">{{ card.name }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
