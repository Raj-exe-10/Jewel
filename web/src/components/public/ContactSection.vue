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
  <section
    :id="resolved.anchorId"
    class="scroll-mt-28 bg-amore-blush py-12 md:scroll-mt-32 sm:py-16"
  >
    <div class="mx-auto max-w-3xl px-4 text-center">
      <p class="mb-2 text-xs uppercase tracking-[0.35em] text-amore-gold">Contact</p>
      <h2 class="mb-3 font-display text-3xl text-amore-charcoal sm:text-4xl">{{ resolved.title }}</h2>
      <p v-for="(paragraph, index) in content.bodyParagraphs" :key="index" class="mb-8 text-neutral-600">
        {{ paragraph }}
      </p>
      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          :href="whatsappLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 bg-whatsapp px-6 py-3 text-sm font-medium text-white transition hover:bg-whatsapp-dark"
        >
          <WhatsAppIcon />
          Chat on WhatsApp
        </a>
        <a
          :href="instagramLink"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="instagram-cta"
          class="inline-flex items-center gap-2 border border-amore-burgundy/20 bg-white px-6 py-3 text-sm font-medium text-amore-charcoal transition hover:border-amore-gold"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
            />
          </svg>
          Follow on Instagram
        </a>
      </div>
    </div>
  </section>
</template>
