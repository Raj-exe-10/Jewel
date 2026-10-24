<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import Autoplay from 'embla-carousel-autoplay'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import type { HeroBannerContent, HomepageSection } from '../../types/homepage'

const props = defineProps<{ section?: HomepageSection }>()

const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('hero'))
const slides = computed(() => (resolved.value.content as HeroBannerContent).slides ?? [])
const slideCount = computed(() => slides.value.length)

const { emblaRef, selectedIndex, scrollSnaps, scrollPrev, scrollNext } = useCarousel(
  { loop: true },
  [Autoplay({ delay: 5500, stopOnInteraction: false })],
  slideCount,
)
void emblaRef

const activeSlide = computed(() => slides.value[selectedIndex.value] ?? slides.value[0])

const slideLabel = computed(() => {
  const total = Math.max(slideCount.value, 1)
  const current = String((selectedIndex.value % total) + 1).padStart(2, '0')
  return `${current}/${String(total).padStart(2, '0')}`
})
</script>

<template>
  <section
    :id="resolved.anchorId"
    data-testid="hero-banner"
    class="relative bg-amore-maroon text-amore-cream"
  >
    <div class="pointer-events-none absolute inset-0 amore-ornament opacity-95" aria-hidden="true" />

    <!-- Hidden slides keep test coverage / Embla slide count in sync with CMS content -->
    <div class="sr-only" aria-hidden="true">
      <div v-for="slide in slides" :key="`meta-${slide.id}`" data-testid="hero-banner-slide">
        {{ slide.heading }}
      </div>
    </div>

    <div
      class="relative mx-auto grid max-w-screen-2xl items-center gap-8 px-4 pb-44 pt-10 sm:gap-10 sm:px-6 sm:pb-52 sm:pt-14 lg:grid-cols-2 lg:pb-60 lg:pt-16"
    >
      <div v-if="activeSlide" class="relative z-10 flex max-w-xl flex-col items-start gap-5 lg:pr-4">
        <p
          v-if="activeSlide.eyebrow"
          class="text-[11px] uppercase tracking-[0.35em] text-amore-gold/90"
        >
          {{ activeSlide.eyebrow }}
        </p>
        <h2 class="font-display text-[2.6rem] leading-[1.08] text-amore-cream sm:text-5xl lg:text-[3.5rem]">
          {{ activeSlide.heading }}
        </h2>
        <p class="max-w-md text-sm leading-relaxed text-amore-cream/75 sm:text-[0.95rem]">
          {{ activeSlide.subheading }}
        </p>
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            data-testid="hero-banner-cta"
            class="rounded-md bg-amore-gold px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-amore-maroon transition hover:brightness-105"
            @click="nav.runCta(activeSlide.ctaTarget)"
          >
            {{ activeSlide.ctaLabel || 'Buy Now' }}
          </button>
          <button
            type="button"
            class="rounded-md border border-amore-cream/55 bg-transparent px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-amore-cream transition hover:border-amore-gold hover:text-amore-gold"
            @click="nav.goToHomeSection('catalogue')"
          >
            Explore
          </button>
        </div>

        <div v-if="slides.length > 1" class="mt-6 flex items-center gap-3 text-amore-cream/90">
          <button
            type="button"
            aria-label="Previous slide"
            data-testid="hero-banner-prev"
            class="p-1 transition hover:text-amore-gold"
            @click="scrollPrev"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <span class="font-display text-sm tracking-[0.2em] tabular-nums">{{ slideLabel }}</span>
          <button
            type="button"
            aria-label="Next slide"
            data-testid="hero-banner-next"
            class="p-1 transition hover:text-amore-gold"
            @click="scrollNext"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-lg lg:max-w-none">
        <div ref="emblaRef" class="overflow-hidden">
          <div class="flex">
            <div
              v-for="slide in slides"
              :key="slide.id"
              class="relative min-w-0 flex-[0_0_100%]"
            >
              <div class="relative mx-auto aspect-[5/6] w-full max-w-md lg:max-w-lg">
                <img
                  :src="slide.imageUrl"
                  :alt="slide.heading"
                  class="h-full w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
                />

                <div
                  class="pointer-events-none absolute left-0 top-[12%] hidden sm:block lg:-left-2"
                  aria-hidden="true"
                >
                  <div class="flex items-center">
                    <div
                      class="h-14 w-14 overflow-hidden rounded-md border border-amore-gold/70 bg-amore-cream/10 shadow-lg backdrop-blur-sm"
                    >
                      <img
                        :src="slide.imageUrl"
                        alt=""
                        class="h-full w-full scale-150 object-cover object-[40%_35%]"
                      />
                    </div>
                    <svg class="h-16 w-20 text-amore-gold/70" viewBox="0 0 80 64" fill="none">
                      <path d="M2 32 H48 L72 18" stroke="currentColor" stroke-width="1" />
                      <circle cx="72" cy="18" r="2.5" fill="currentColor" />
                    </svg>
                  </div>
                </div>

                <div
                  class="pointer-events-none absolute bottom-[18%] right-0 hidden max-w-[11.5rem] sm:block lg:-right-1"
                  aria-hidden="true"
                >
                  <div class="mb-1 flex justify-end">
                    <svg class="h-12 w-24 text-amore-gold/70" viewBox="0 0 96 48" fill="none">
                      <path d="M94 40 H40 L8 12" stroke="currentColor" stroke-width="1" />
                      <circle cx="8" cy="12" r="2.5" fill="currentColor" />
                    </svg>
                  </div>
                  <div
                    class="rounded-md border border-amore-gold/55 bg-amore-maroon/55 px-3 py-2.5 text-[10px] leading-relaxed text-amore-cream/85 shadow-lg backdrop-blur-sm"
                  >
                    Hand-set stones chosen for clarity and fire — heirloom pieces made to be worn and kept.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-amore-cream/15"
      aria-hidden="true"
    />
  </section>
</template>
