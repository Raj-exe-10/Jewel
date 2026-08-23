<script setup lang="ts">
/**
 * Shared stylish section heading — centered, gold accent, jewelry glyph.
 */
defineProps<{
  title: string
  subtitle?: string
  /** Decorative glyph shown above the title (emoji or short symbol). */
  icon?: string
}>()
</script>

<template>
  <div class="mb-5 text-center" data-testid="section-heading">
    <div v-if="icon" class="mb-3 flex items-center justify-center gap-3 text-amore-header" aria-hidden="true">
      <span class="h-px w-10 bg-amore-header/50 sm:w-16" />
      <span class="text-2xl leading-none">{{ icon }}</span>
      <span class="h-px w-10 bg-amore-header/50 sm:w-16" />
    </div>
    <h2 class="font-display text-3xl font-semibold tracking-wide text-amore-header sm:text-4xl">{{ title }}</h2>
    <p v-if="subtitle" class="mt-2 text-sm text-neutral-600">{{ subtitle }}</p>
  </div>
</template>
