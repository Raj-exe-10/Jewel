<script setup lang="ts">
import { computed } from 'vue'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { FOUNDER_IMAGE, HERO_IMAGES, jewelryImageFor } from '../../data/storefrontMedia'
import type { AboutContent, HomepageSection } from '../../types/homepage'

const props = defineProps<{ section?: HomepageSection }>()

const resolved = computed(() => props.section ?? defaultSectionByAnchor('about'))
const content = computed(() => resolved.value.content as AboutContent)
const storyImageSrc = computed(() => content.value.imageUrl || FOUNDER_IMAGE)
const ringImage = jewelryImageFor('ring')
const necklaceImage = HERO_IMAGES.bridal
</script>

<template>
  <section :id="resolved.anchorId" class="scroll-mt-28 amore-ornament py-12 md:scroll-mt-32 sm:py-16">
    <div class="mx-auto max-w-screen-2xl px-4">
      <div
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5"
        data-testid="about-banner"
      >
        <div class="flex flex-col gap-4 lg:col-span-3">
          <div class="aspect-square overflow-hidden border border-amore-gold/30">
            <img :src="ringImage" alt="Amore ring detail" class="h-full w-full object-cover" />
          </div>
          <div class="aspect-[3/4] overflow-hidden border border-amore-gold/30">
            <img
              :src="storyImageSrc"
              :alt="resolved.title"
              class="h-full w-full object-cover"
              data-testid="about-image"
            />
          </div>
        </div>

        <div class="overflow-hidden border border-amore-gold/30 sm:row-span-1 lg:col-span-4">
          <img
            :src="necklaceImage"
            alt="Amore heritage jewellery"
            class="h-full min-h-72 w-full object-cover lg:min-h-full"
          />
        </div>

        <div class="flex flex-col justify-center gap-5 border border-amore-gold/20 bg-amore-maroon/40 p-6 text-amore-cream sm:col-span-2 lg:col-span-5 lg:p-8">
          <p class="text-xs uppercase tracking-[0.35em] text-amore-gold">
            {{ content.eyebrow || 'Our Story' }}
          </p>
          <h2 class="font-display text-3xl leading-tight sm:text-4xl">
            {{ resolved.title || 'Crafting Jewellery Since 1888' }}
          </h2>
          <p
            v-for="(paragraph, index) in content.bodyParagraphs"
            :key="index"
            class="text-sm leading-relaxed text-amore-cream/80"
          >
            {{ paragraph }}
          </p>
          <a
            href="#contact"
            class="mt-2 inline-flex w-fit bg-amore-gold px-5 py-2.5 text-sm font-medium tracking-wide text-amore-maroon transition hover:brightness-105"
          >
            Visit the Atelier
          </a>
          <div class="mt-4 border-t border-amore-cream/15 pt-4">
            <p class="font-display text-xl text-amore-gold">Wedding Collection</p>
            <p class="mt-1 text-sm text-amore-cream/65">
              Heirloom bridal sets crafted for the moments that become forever.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
