<script setup lang="ts">
import { computed } from 'vue'
import { buildInstagramProfileLink } from '../../composables/useWhatsAppLink'
import { createSectionDraft } from '../../data/defaultSections'
import type { HomepageSection, InstagramGalleryContent } from '../../types/homepage'

const props = defineProps<{ instagramHandle: string; section?: HomepageSection }>()

const fallbackSection = createSectionDraft('instagram_gallery', 0)
const resolved = computed(() => props.section ?? ({ ...fallbackSection, id: 'instagram-fallback', createdAt: 0, updatedAt: 0, updatedBy: 'seed' } as HomepageSection))
const content = computed(() => resolved.value.content as InstagramGalleryContent)
const profileLink = computed(() => buildInstagramProfileLink(props.instagramHandle))
const handleLabel = computed(() => `@${props.instagramHandle.replace(/^@/, '')}`)
const tiles = computed(() => (content.value.tiles ?? []).slice(0, 6))
</script>

<template>
  <section :id="resolved.anchorId || 'instagram'" class="relative bg-amore-cream">
    <div class="grid grid-cols-3 sm:grid-cols-6">
      <a
        v-for="tile in tiles"
        :key="tile.id"
        :href="profileLink"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="instagram-tile"
        class="group relative block aspect-square overflow-hidden"
      >
        <img
          :src="tile.imageUrl"
          :alt="tile.alt ?? 'Amore on Instagram'"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span class="absolute inset-0 bg-amore-maroon/0 transition group-hover:bg-amore-maroon/25" />
      </a>
    </div>

    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <a
        :href="profileLink"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="instagram-profile-link"
        class="pointer-events-auto inline-flex items-center gap-2 border border-amore-burgundy/10 bg-white px-5 py-3 text-sm font-medium tracking-wide text-amore-charcoal shadow-lg transition hover:border-amore-gold"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
          />
        </svg>
        Instagram
        <span class="text-neutral-500">{{ handleLabel }}</span>
      </a>
    </div>
  </section>
</template>
