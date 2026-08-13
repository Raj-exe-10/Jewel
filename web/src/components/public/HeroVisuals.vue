<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { VISUAL_VIDEOS } from '../../data/storefrontMedia'
import SectionHeading from './SectionHeading.vue'

const nav = useCatalogueNav()
const tiles = VISUAL_VIDEOS
const slideCount = computed(() => tiles.length)

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef

function onTileClick() {
  nav.clearAndScrollToCatalogue()
}
</script>

<template>
  <section id="shop-the-visuals" class="mx-auto max-w-6xl px-4 pt-14">
    <div class="relative mb-2">
      <SectionHeading
        title="Shop the Visuals"
        subtitle="Watch our pieces in motion — bridal edits, festive looks, and everyday glow"
        icon="✦"
      />
      <div class="absolute right-0 top-8 z-10 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-visuals-prev"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:bg-amore-cream"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-visuals-next"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:bg-amore-cream"
          @click.stop="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex touch-pan-y">
        <button
          v-for="(tile, index) in tiles"
          :key="tile.label"
          type="button"
          data-testid="shop-visuals-tile"
          class="group relative mr-4 min-w-0 flex-[0_0_70%] overflow-hidden rounded-2xl sm:flex-[0_0_40%] lg:flex-[0_0_28%]"
          @click="onTileClick"
        >
          <video
            class="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
            :poster="tile.poster"
            :src="tile.src"
            muted
            loop
            playsinline
            autoplay
            preload="metadata"
          />
          <span class="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <span class="absolute inset-x-0 bottom-4 text-center font-display text-lg text-white drop-shadow">
            {{ tile.label }}
          </span>
          <span
            v-if="index === 0"
            class="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amore-charcoal"
          >
            Video
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
