<script setup lang="ts">
import { computed } from 'vue'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import type { AboutContent, HomepageSection } from '../../types/homepage'

const props = defineProps<{ section?: HomepageSection }>()

const resolved = computed(() => props.section ?? defaultSectionByAnchor('about'))
const content = computed(() => resolved.value.content as AboutContent)
</script>

<template>
  <section :id="resolved.anchorId" class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid items-center gap-10 sm:grid-cols-2">
      <img
        :src="content.imageUrl"
        :alt="resolved.title"
        class="aspect-[4/5] w-full rounded-2xl object-cover"
      />
      <div class="text-center sm:text-left">
        <p class="mb-2 text-xs uppercase tracking-[0.3em] text-amore-gold">{{ content.eyebrow }}</p>
        <h2 class="mb-4 font-display text-3xl text-neutral-900">{{ resolved.title }}</h2>
        <p v-for="(paragraph, index) in content.bodyParagraphs" :key="index" class="text-neutral-600" :class="{ 'mt-4': index > 0 }">
          {{ paragraph }}
        </p>
      </div>
    </div>
  </section>
</template>
