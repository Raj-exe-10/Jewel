<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import Autoplay from 'embla-carousel-autoplay'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { HERO_IMAGES } from '../../data/storefrontMedia'

const nav = useCatalogueNav()

const slides = [
  {
    id: 'bridal',
    image: HERO_IMAGES.bridal,
    eyebrow: 'New Season',
    heading: 'Discover the Bridal Edit',
    subheading: 'Kundan, polki, and antique pieces made to be heirlooms.',
    ctaLabel: 'Shop Bridal',
    action: () => nav.filterByBridal(),
  },
  {
    id: 'new-arrivals',
    image: HERO_IMAGES.newArrivals,
    eyebrow: 'Just In',
    heading: 'New Arrivals, Handcrafted with Love',
    subheading: 'Everyday pieces that go from desk to dinner.',
    ctaLabel: 'Shop New Arrivals',
    action: () => nav.scrollToSection('shop-the-visuals'),
  },
  {
    id: 'signature',
    image: HERO_IMAGES.signature,
    eyebrow: "Founder's Picks",
    heading: 'Signature Pieces, Made to Be Loved',
    subheading: 'Our most-requested designs, curated by the Amore team.',
    ctaLabel: 'Shop Signature Picks',
    action: () => nav.scrollToSection('founders-favourites'),
  },
]

const slideCount = computed(() => slides.length)
const { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext, scrollTo } = useCarousel(
  { loop: true },
  [Autoplay({ delay: 5500, stopOnInteraction: false })],
  slideCount,
)
void emblaRef
</script>

<template>
  <section data-testid="hero-banner" class="relative overflow-hidden">
    <div ref="emblaRef" class="overflow-hidden">
      <div class="flex">
        <div v-for="slide in slides" :key="slide.id" data-testid="hero-banner-slide" class="relative min-w-0 flex-[0_0_100%]">
          <div class="relative h-[60vh] min-h-[420px] w-full sm:h-[70vh]">
            <img :src="slide.image" :alt="slide.heading" class="absolute inset-0 h-full w-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-6 pb-14 text-center text-white">
              <p class="text-xs uppercase tracking-[0.3em] text-amore-cream">{{ slide.eyebrow }}</p>
              <h2 class="font-display text-3xl sm:text-5xl">{{ slide.heading }}</h2>
              <p class="max-w-md text-sm text-white/80 sm:text-base">{{ slide.subheading }}</p>
              <button
                type="button"
                data-testid="hero-banner-cta"
                class="mt-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium tracking-wide text-amore-charcoal transition hover:bg-amore-cream"
                @click="slide.action"
              >
                {{ slide.ctaLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      aria-label="Previous slide"
      data-testid="hero-banner-prev"
      class="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-neutral-800 transition hover:bg-white"
      @click="scrollPrev"
    >
      <ChevronLeftIcon class="h-5 w-5" />
    </button>
    <button
      type="button"
      aria-label="Next slide"
      data-testid="hero-banner-next"
      class="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-neutral-800 transition hover:bg-white"
      @click="scrollNext"
    >
      <ChevronRightIcon class="h-5 w-5" />
    </button>

    <div v-if="scrollSnaps.length > 1" class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
      <button
        v-for="(_, index) in scrollSnaps"
        :key="index"
        type="button"
        :aria-label="`Go to slide ${index + 1}`"
        data-testid="hero-banner-dot"
        class="h-1.5 w-1.5 rounded-full transition-all"
        :class="index === selectedIndex ? 'w-4 bg-white' : 'bg-white/50'"
        @click="scrollTo(index)"
      />
    </div>
  </section>
</template>
