<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import Autoplay from 'embla-carousel-autoplay'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import type { ProductMediaItem } from '../../lib/productMedia'

const props = defineProps<{
  media: ProductMediaItem[]
  productName: string
}>()

const slides = computed(() => [...props.media].sort((a, b) => a.sortOrder - b.sortOrder))
const slideCount = computed(() => slides.value.length)

const { emblaRef, selectedIndex, scrollPrev, scrollNext, scrollTo } = useCarousel(
  { loop: true, align: 'center', containScroll: 'trimSnaps' },
  [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })],
  slideCount,
)
void emblaRef

function thumbSrc(item: ProductMediaItem): string {
  if (item.kind === 'image') return item.url
  return item.posterUrl || item.url
}
</script>

<template>
  <div data-testid="product-media-carousel" class="relative mx-auto w-full max-w-md lg:max-w-lg">
    <div
      class="relative overflow-hidden rounded-sm border border-amore-gold/50 bg-gradient-to-b from-[#f7f0e4] to-amore-cream p-2 shadow-[inset_0_0_0_1px_rgba(176,141,87,0.25)]"
    >
      <div class="pointer-events-none absolute inset-x-6 top-3 z-10 h-px bg-gradient-to-r from-transparent via-amore-gold/70 to-transparent" />
      <div class="pointer-events-none absolute inset-x-6 bottom-3 z-10 h-px bg-gradient-to-r from-transparent via-amore-gold/70 to-transparent" />

      <div ref="emblaRef" class="overflow-hidden rounded-sm">
        <div class="flex">
          <div
            v-for="item in slides"
            :key="item.id"
            data-testid="product-media-item"
            class="group min-w-0 flex-[0_0_100%]"
          >
            <img
              v-if="item.kind === 'image'"
              :src="item.url"
              :alt="productName"
              class="aspect-square w-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />
            <video
              v-else
              :src="item.url"
              :poster="item.posterUrl || undefined"
              class="aspect-square w-full object-cover"
              controls
              playsinline
              muted
              loop
              preload="metadata"
            />
          </div>
        </div>
      </div>

      <button
        v-if="slides.length > 1"
        type="button"
        aria-label="Previous media"
        data-testid="product-media-prev"
        class="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-amore-gold/60 bg-white/90 p-2 text-amore-charcoal shadow-sm transition hover:bg-amore-cream"
        @click="scrollPrev"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </button>
      <button
        v-if="slides.length > 1"
        type="button"
        aria-label="Next media"
        data-testid="product-media-next"
        class="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-amore-gold/60 bg-white/90 p-2 text-amore-charcoal shadow-sm transition hover:bg-amore-cream"
        @click="scrollNext"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </button>
    </div>

    <div v-if="slides.length > 1" class="mt-4 flex flex-wrap items-center justify-center gap-2">
      <button
        v-for="(item, index) in slides"
        :key="`thumb-${item.id}`"
        type="button"
        data-testid="product-media-thumb"
        class="h-16 w-12 overflow-hidden rounded-sm border transition"
        :class="
          selectedIndex === index
            ? 'border-amore-gold ring-1 ring-amore-gold/40'
            : 'border-neutral-200 opacity-80 hover:opacity-100'
        "
        @click="scrollTo(index)"
      >
        <img
          v-if="item.kind === 'image' || item.posterUrl"
          :src="thumbSrc(item)"
          :alt="`${productName} media ${index + 1}`"
          class="h-full w-full object-cover"
        />
        <span
          v-else
          class="flex h-full w-full items-center justify-center bg-amore-cream text-[10px] uppercase tracking-wide text-amore-gold"
        >
          Video
        </span>
      </button>
    </div>

    <div v-if="slides.length > 1" class="mt-3 flex justify-center gap-2">
      <button
        v-for="(item, index) in slides"
        :key="`dot-${item.id}`"
        type="button"
        class="h-1.5 w-1.5 rounded-full transition"
        :class="selectedIndex === index ? 'bg-amore-gold' : 'bg-neutral-300'"
        :aria-label="`Go to media ${index + 1}`"
        @click="scrollTo(index)"
      />
    </div>
  </div>
</template>
