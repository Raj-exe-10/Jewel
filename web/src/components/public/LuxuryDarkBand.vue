<script setup lang="ts">
/**
 * Dark maroon band with ornamental texture — used for diamond / ruby / heritage sections.
 */
withDefaults(
  defineProps<{
    id?: string
    padded?: boolean
  }>(),
  { padded: true },
)
</script>

<template>
  <section :id="id" class="amore-ornament text-amore-cream" :class="padded ? 'py-12 sm:py-16' : ''">
    <div class="mx-auto max-w-screen-2xl px-4">
      <slot />
    </div>
  </section>
</template>
