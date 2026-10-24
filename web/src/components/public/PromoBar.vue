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
  <div class="bg-amore-maroon px-4 py-1.5 text-center text-[11px] tracking-[0.14em] text-amore-cream/90">
    {{ message }}
  </div>
</template>
