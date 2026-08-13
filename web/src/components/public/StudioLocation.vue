<script setup lang="ts">
import { computed } from 'vue'
import { buildGeneralEnquiryLink } from '../../composables/useWhatsAppLink'
import { STUDIO_IMAGE } from '../../data/storefrontMedia'
import WhatsAppIcon from './WhatsAppIcon.vue'

const props = defineProps<{ businessPhoneE164: string }>()

const whatsappLink = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
</script>

<template>
  <section class="bg-amore-cream py-14">
    <div class="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:grid-cols-2">
      <img
        :src="STUDIO_IMAGE"
        alt="Amore studio"
        class="aspect-[4/3] w-full rounded-2xl object-cover"
      />
      <div>
        <p class="mb-2 text-xs uppercase tracking-[0.3em] text-amore-gold">Visit the Studio</p>
        <h2 class="mb-4 font-display text-2xl text-neutral-900">By Appointment Only</h2>
        <p class="mb-1 text-neutral-700">Amore Studio</p>
        <p class="mb-4 text-sm text-neutral-500" data-testid="studio-address">
          Studio address to be added — update this section with your atelier's location.
        </p>
        <div class="flex flex-wrap gap-3">
          <a
            href="https://maps.google.com"
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
