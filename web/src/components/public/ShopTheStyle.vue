<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import Autoplay from 'embla-carousel-autoplay'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection, TaxonomyTilesContent } from '../../types/homepage'

const props = defineProps<{ section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('shop-the-style'))
const overrides = computed(() => (resolved.value.content as TaxonomyTilesContent).tileImageOverrides ?? {})

const styleCards = computed(() =>
  catalogue.styleTags.map((tag, index) => ({
    id: tag.id,
    name: tag.name,
    image: overrides.value[tag.id] ?? jewelryImageFor(tag.name, index),
  })),
)
const slideCount = computed(() => styleCards.value.length)

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: true, align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })],
  slideCount,
)
void emblaRef
</script>

<template>
  <section v-if="styleCards.length > 0" :id="resolved.anchorId" class="bg-amore-cream py-12 sm:py-16">
    <div class="mx-auto max-w-screen-2xl px-4">
      <div class="relative mb-8">
        <div class="text-center">
          <p class="mb-2 text-xs uppercase tracking-[0.35em] text-amore-gold">Mood & Occasion</p>
          <h2 class="font-display text-3xl text-amore-charcoal sm:text-4xl">{{ resolved.title }}</h2>
          <p v-if="resolved.subtitle" class="mt-2 text-sm text-neutral-600">{{ resolved.subtitle }}</p>
        </div>
        <div class="absolute right-0 top-0 hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous"
            data-testid="shop-style-prev"
            class="border border-amore-burgundy/25 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:border-amore-gold"
            @click.stop="scrollPrev"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            data-testid="shop-style-next"
            class="border border-amore-burgundy/25 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:border-amore-gold"
            @click.stop="scrollNext"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref="emblaRef" class="overflow-hidden">
        <div class="flex">
          <button
            v-for="card in styleCards"
            :key="card.id"
            type="button"
            data-testid="style-tag-card"
            class="group relative mr-4 min-w-0 flex-[0_0_78%] overflow-hidden border border-amore-burgundy/15 sm:flex-[0_0_42%] lg:flex-[0_0_28%]"
            @click="nav.filterByStyleTag(card.id)"
          >
            <img
              :src="card.image"
              :alt="card.name"
              class="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span class="absolute inset-0 bg-gradient-to-t from-amore-maroon/80 via-amore-maroon/10 to-transparent" />
            <span class="absolute inset-x-0 bottom-5 text-center font-display text-2xl text-amore-cream">
              {{ card.name }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
