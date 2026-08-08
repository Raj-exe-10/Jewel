<script setup lang="ts">
import { computed } from 'vue'
import { buildInstagramProfileLink } from '../../composables/useWhatsAppLink'

const props = defineProps<{ instagramHandle: string }>()

const profileLink = computed(() => buildInstagramProfileLink(props.instagramHandle))
const handleLabel = computed(() => `@${props.instagramHandle.replace(/^@/, '')}`)

const tiles = Array.from({ length: 6 }, (_, index) => ({
  id: index,
  image: `https://picsum.photos/seed/amore-instagram-${index + 1}/500/500`,
}))
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-14 text-center">
    <p class="mb-2 text-xs uppercase tracking-[0.3em] text-amore-gold">Follow Along</p>
    <h2 class="mb-2 font-display text-2xl text-neutral-900">{{ handleLabel }}</h2>
    <a
      :href="profileLink"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="instagram-profile-link"
      class="mb-8 inline-block text-sm font-medium text-amore-charcoal underline-offset-4 hover:underline"
    >
      View on Instagram
    </a>

    <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
      <a
        v-for="tile in tiles"
        :key="tile.id"
        :href="profileLink"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="instagram-tile"
        class="group block aspect-square overflow-hidden"
      >
        <img
          :src="tile.image"
          alt="Amore on Instagram"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </a>
    </div>
  </section>
</template>
