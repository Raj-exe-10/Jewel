<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import type { HomepageSection, VideoCarouselContent } from '../../types/homepage'

const props = defineProps<{ section?: HomepageSection }>()

const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('shop-the-visuals'))
const tiles = computed(() =>
  [...((resolved.value.content as VideoCarouselContent).videos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
)
const slideCount = computed(() => tiles.value.length)

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: true, align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef

function onTileClick() {
  nav.clearAndScrollToCatalogue()
}
</script>

<template>
  <section v-if="tiles.length > 0" :id="resolved.anchorId" class="scroll-mt-28 bg-amore-cream py-12 md:scroll-mt-32 sm:py-14">
    <div class="mx-auto max-w-screen-2xl px-4">
      <div class="relative mb-8">
        <div class="text-center">
          <p class="mb-2 text-xs uppercase tracking-[0.35em] text-amore-gold">In Motion</p>
          <h2 class="font-display text-3xl text-amore-charcoal sm:text-4xl">{{ resolved.title }}</h2>
          <p v-if="resolved.subtitle" class="mt-2 text-sm text-neutral-600">{{ resolved.subtitle }}</p>
        </div>
        <div class="absolute right-0 top-0 hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous"
            data-testid="shop-visuals-prev"
            class="border border-amore-burgundy/25 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:border-amore-gold"
            @click.stop="scrollPrev"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            data-testid="shop-visuals-next"
            class="border border-amore-burgundy/25 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:border-amore-gold"
            @click.stop="scrollNext"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        id="shop-the-visuals-products"
        ref="emblaRef"
        class="scroll-mt-36 overflow-hidden md:scroll-mt-40"
      >
        <div class="flex touch-pan-y">
          <button
            v-for="(tile, index) in tiles"
            :key="tile.id"
            type="button"
            data-testid="shop-visuals-tile"
            class="group relative mr-4 min-w-0 flex-[0_0_78%] overflow-hidden border border-amore-burgundy/15 sm:flex-[0_0_42%] lg:flex-[0_0_28%]"
            @click="onTileClick"
          >
            <video
              class="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
              :poster="tile.posterUrl"
              :src="tile.videoUrl"
              muted
              loop
              playsinline
              autoplay
              preload="metadata"
            />
            <span class="absolute inset-0 bg-gradient-to-t from-amore-maroon/75 via-transparent to-transparent" />
            <span class="absolute inset-x-0 bottom-4 text-center font-display text-lg text-amore-cream drop-shadow">
              {{ tile.label }}
            </span>
            <span
              v-if="index === 0"
              class="absolute left-3 top-3 bg-amore-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amore-maroon"
            >
              Video
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
