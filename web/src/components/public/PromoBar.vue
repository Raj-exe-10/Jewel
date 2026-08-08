<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: 'Handcrafted, made-to-order pieces — chat with us on WhatsApp for bespoke bridal sets',
  },
)
</script>

<template>
  <div class="bg-amore-charcoal px-4 py-2 text-center text-xs tracking-wide text-amore-cream">
    {{ message }}
  </div>
</template>
