<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection, TaxonomyTilesContent } from '../../types/homepage'
import SectionHeading from './SectionHeading.vue'

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
  { align: 'start', containScroll: 'trimSnaps', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef
</script>

<template>
  <section v-if="styleCards.length > 0" :id="resolved.anchorId" class="mx-auto max-w-6xl px-4 py-14">
    <div class="relative mb-2">
      <SectionHeading
        :title="resolved.title"
        :subtitle="resolved.subtitle"
        :icon="resolved.icon"
      />
      <div class="absolute right-0 top-8 z-10 hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="shop-style-prev"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:bg-amore-cream"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="shop-style-next"
          class="rounded-full border border-amore-gold/40 bg-white p-1.5 text-amore-charcoal shadow-sm transition hover:bg-amore-cream"
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
          class="group relative mr-4 min-w-0 flex-[0_0_70%] overflow-hidden rounded-xl sm:flex-[0_0_40%] lg:flex-[0_0_28%]"
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
