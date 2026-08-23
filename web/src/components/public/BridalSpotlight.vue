<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import type { HomepageSection, ProductCarouselContent } from '../../types/homepage'

const props = defineProps<{ businessPhoneE164: string; section?: HomepageSection }>()

const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('bridal'))
const content = computed(() => resolved.value.content as ProductCarouselContent)
</script>

<template>
  <section :id="resolved.anchorId" class="bg-amore-theme py-8">
    <div class="mx-auto max-w-screen-2xl px-4">
      <div
        class="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-amore-charcoal text-amore-cream sm:grid-cols-2"
        data-testid="bridal-banner"
      >
        <img
          :src="content.bannerImageUrl"
          :alt="content.bannerHeading ?? resolved.title"
          class="h-full min-h-48 w-full object-cover sm:min-h-64"
        />
        <div class="flex min-h-48 flex-col justify-center gap-3 p-6 sm:min-h-64 sm:p-8">
          <p class="text-xs uppercase tracking-[0.3em] text-amore-gold">{{ content.bannerEyebrow }}</p>
          <h2 class="font-display text-2xl sm:text-3xl">{{ content.bannerHeading }}</h2>
          <p class="text-sm text-amore-cream/80 sm:text-base">{{ content.bannerBody }}</p>
          <button
            type="button"
            data-testid="bridal-cta"
            class="mt-2 w-fit rounded-full bg-white px-5 py-2.5 text-sm font-medium text-amore-charcoal transition hover:bg-amore-theme"
            @click="nav.filterByBridal"
          >
            {{ content.bannerCtaLabel }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
