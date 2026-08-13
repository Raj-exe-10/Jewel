<script setup lang="ts">
import { computed } from 'vue'
import { buildGeneralEnquiryLink, buildInstagramProfileLink } from '../../composables/useWhatsAppLink'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import type { ContactContent, HomepageSection } from '../../types/homepage'
import WhatsAppIcon from './WhatsAppIcon.vue'

const props = defineProps<{ businessPhoneE164: string; instagramHandle: string; section?: HomepageSection }>()

const resolved = computed(() => props.section ?? defaultSectionByAnchor('contact'))
const content = computed(() => resolved.value.content as ContactContent)
const whatsappLink = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
const instagramLink = computed(() => buildInstagramProfileLink(props.instagramHandle))
</script>

<template>
  <section :id="resolved.anchorId" class="mx-auto max-w-3xl px-4 py-16 text-center">
    <h2 class="mb-3 font-display text-2xl text-amore-gold">{{ resolved.title }}</h2>
    <p v-for="(paragraph, index) in content.bodyParagraphs" :key="index" class="mb-8 text-neutral-600">
      {{ paragraph }}
    </p>
    <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <a
        :href="whatsappLink"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-medium text-white transition hover:bg-whatsapp-dark"
      >
        <WhatsAppIcon />
        Chat on WhatsApp
      </a>
      <a
        :href="instagramLink"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800"
      >
        Follow on Instagram
      </a>
    </div>
  </section>
</template>
