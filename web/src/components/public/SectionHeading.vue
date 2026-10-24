<script setup lang="ts">
/**
 * Shared stylish section heading — centered, gold accent, jewelry glyph.
 */
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    /** Decorative glyph shown above the title (emoji or short symbol). */
    icon?: string
    /** Invert colors for use on dark maroon bands. */
    onDark?: boolean
  }>(),
  { onDark: false },
)
</script>

<template>
  <div class="mb-5 text-center" data-testid="section-heading">
    <div
      v-if="icon"
      class="mb-3 flex items-center justify-center gap-3"
      :class="onDark ? 'text-amore-gold' : 'text-amore-header'"
      aria-hidden="true"
    >
      <span class="h-px w-10 sm:w-16" :class="onDark ? 'bg-amore-gold/40' : 'bg-amore-header/50'" />
      <span class="text-2xl leading-none">{{ icon }}</span>
      <span class="h-px w-10 sm:w-16" :class="onDark ? 'bg-amore-gold/40' : 'bg-amore-header/50'" />
    </div>
    <h2
      class="font-display text-3xl font-semibold tracking-wide sm:text-4xl"
      :class="onDark ? 'text-amore-cream' : 'text-amore-header'"
    >
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mt-2 text-sm" :class="onDark ? 'text-amore-cream/70' : 'text-neutral-600'">
      {{ subtitle }}
    </p>
  </div>
</template>
