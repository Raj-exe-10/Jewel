<script setup lang="ts">
import { computed } from 'vue'
import { buildGeneralEnquiryLink } from '../../composables/useWhatsAppLink'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { useBusinessStore } from '../../stores/business'
import type { HomepageSection, StudioLocationContent } from '../../types/homepage'
import WhatsAppIcon from './WhatsAppIcon.vue'

const props = defineProps<{ businessPhoneE164: string; section?: HomepageSection }>()
const business = useBusinessStore()

const resolved = computed(() => props.section ?? defaultSectionByAnchor('studio'))
const content = computed(() => resolved.value.content as StudioLocationContent)
const displayAddress = computed(() => business.address || content.value.address || '')
const displayMapUrl = computed(() => business.mapUrl || content.value.mapUrl || 'https://maps.google.com')
const whatsappLink = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
</script>

<template>
  <section :id="resolved.anchorId" class="bg-amore-theme py-8">
    <div class="mx-auto grid max-w-screen-2xl items-center gap-8 px-4 sm:grid-cols-2">
      <img
        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"
        alt="Amore studio"
        class="aspect-[4/3] w-full rounded-2xl object-cover"
        data-testid="studio-image"
      />
      <div>
        <p class="mb-2 text-xs uppercase tracking-[0.3em] text-amore-gold">{{ content.eyebrow }}</p>
        <h2 class="mb-4 font-display text-2xl text-neutral-900">{{ resolved.title }}</h2>
        <p v-for="(paragraph, index) in content.bodyParagraphs" :key="index" class="mb-1 text-neutral-700">
          {{ paragraph }}
        </p>
        <p class="mb-4 text-sm text-neutral-500" data-testid="studio-address">
          {{ displayAddress }}
        </p>
        <div class="flex flex-wrap gap-3">
          <a
            :href="displayMapUrl"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="studio-directions-link"
            class="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-white"
          >
            Get Directions
          </a>
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="studio-appointment-link"
            class="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-medium text-white transition hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon />
            Book an Appointment
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
