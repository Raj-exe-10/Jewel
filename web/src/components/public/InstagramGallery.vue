<script setup lang="ts">
import { computed } from 'vue'
import { buildInstagramProfileLink } from '../../composables/useWhatsAppLink'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import type { HomepageSection, InstagramGalleryContent } from '../../types/homepage'
import SectionHeading from './SectionHeading.vue'

const props = defineProps<{ instagramHandle: string; section?: HomepageSection }>()

const resolved = computed(() => props.section ?? defaultSectionByAnchor('instagram'))
const content = computed(() => resolved.value.content as InstagramGalleryContent)
const profileLink = computed(() => buildInstagramProfileLink(props.instagramHandle))
const handleLabel = computed(() => `@${props.instagramHandle.replace(/^@/, '')}`)
</script>

<template>
  <section :id="resolved.anchorId" class="mx-auto max-w-screen-2xl px-4 py-8">
    <SectionHeading :title="resolved.title" :subtitle="resolved.subtitle ?? handleLabel" :icon="resolved.icon" />
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
        v-for="tile in content.tiles"
        :key="tile.id"
        :href="profileLink"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="instagram-tile"
        class="group block aspect-square overflow-hidden"
      >
        <img
          :src="tile.imageUrl"
          :alt="tile.alt ?? 'Amore on Instagram'"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </a>
    </div>
  </section>
</template>
