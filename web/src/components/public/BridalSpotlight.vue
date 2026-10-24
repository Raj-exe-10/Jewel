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
  <section :id="resolved.anchorId" class="bg-gradient-to-br from-amore-cream via-amore-blush to-[#efe4d6] py-12 sm:py-16">
    <div class="mx-auto max-w-screen-2xl px-4">
      <div
        class="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
        data-testid="bridal-banner"
      >
        <div class="max-w-xl">
          <p class="mb-3 text-xs uppercase tracking-[0.35em] text-amore-gold">
            {{ content.bannerEyebrow || 'For Business' }}
          </p>
          <h2 class="font-display text-3xl leading-tight text-amore-charcoal sm:text-4xl lg:text-5xl">
            {{ content.bannerHeading || 'Get the best diamonds for your business' }}
          </h2>
          <p class="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {{ content.bannerBody || resolved.subtitle }}
          </p>
          <button
            type="button"
            data-testid="bridal-cta"
            class="mt-7 bg-amore-maroon px-6 py-3 text-sm font-medium tracking-wide text-amore-cream transition hover:bg-amore-burgundy"
            @click="nav.filterByBridal"
          >
            {{ content.bannerCtaLabel || 'Explore Collection' }}
          </button>
        </div>

        <div class="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div
            class="pointer-events-none absolute -left-3 -top-3 h-16 w-16 border-l-2 border-t-2 border-amore-gold sm:-left-5 sm:-top-5"
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 border-b-2 border-r-2 border-amore-gold sm:-bottom-5 sm:-right-5"
            aria-hidden="true"
          />
          <div class="border-2 border-amore-gold/70 bg-amore-cream p-2 shadow-[0_20px_50px_-28px_rgba(61,10,20,0.45)] sm:p-3">
            <img
              :src="content.bannerImageUrl"
              :alt="content.bannerHeading ?? resolved.title"
              class="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
