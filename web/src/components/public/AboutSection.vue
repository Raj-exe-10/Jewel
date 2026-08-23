<script setup lang="ts">
import { computed } from 'vue'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import type { AboutContent, HomepageSection } from '../../types/homepage'

const props = defineProps<{ section?: HomepageSection }>()

const resolved = computed(() => props.section ?? defaultSectionByAnchor('about'))
const content = computed(() => resolved.value.content as AboutContent)
const storyImageSrc = '/brand/amore-logo.jpg'
</script>

<template>
  <section :id="resolved.anchorId" class="scroll-mt-28 bg-amore-theme px-4 py-10 md:scroll-mt-32">
    <div
      class="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-amore-burgundy text-amore-cream sm:grid-cols-2"
      data-testid="about-banner"
    >
      <img
        :src="storyImageSrc"
        :alt="resolved.title"
        class="h-full min-h-48 w-full object-cover sm:min-h-64"
        data-testid="about-image"
      />
      <div class="flex flex-col justify-center gap-3 bg-amore-burgundy p-6 sm:p-8">
        <p class="text-xs uppercase tracking-[0.3em] text-amore-gold">
          {{ content.eyebrow || 'Our Story' }}
        </p>
        <h2 class="font-display text-2xl text-amore-cream sm:text-3xl">{{ resolved.title }}</h2>
        <p
          v-for="(paragraph, index) in content.bodyParagraphs"
          :key="index"
          class="text-sm leading-relaxed text-amore-cream/80"
        >
          {{ paragraph }}
        </p>
      </div>
    </div>
  </section>
</template>
