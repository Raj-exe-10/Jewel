<script setup lang="ts">
import { computed } from 'vue'
import { buildInstagramProfileLink } from '../../composables/useWhatsAppLink'
import { INSTAGRAM_TILES } from '../../data/storefrontMedia'
import SectionHeading from './SectionHeading.vue'

const props = defineProps<{ instagramHandle: string }>()

const profileLink = computed(() => buildInstagramProfileLink(props.instagramHandle))
const handleLabel = computed(() => `@${props.instagramHandle.replace(/^@/, '')}`)
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-14">
    <SectionHeading title="Follow Along" :subtitle="handleLabel" icon="◎" />
    <div class="mb-8 text-center">
      <a
        :href="profileLink"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="instagram-profile-link"
        class="inline-block text-sm font-medium text-amore-gold underline-offset-4 hover:underline"
      >
        View on Instagram
      </a>
    </div>

    <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
      <a
        v-for="tile in INSTAGRAM_TILES"
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
