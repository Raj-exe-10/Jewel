<script setup lang="ts">
import { computed } from 'vue'
import { buildGeneralEnquiryLink, buildInstagramProfileLink } from '../../composables/useWhatsAppLink'
import WhatsAppIcon from './WhatsAppIcon.vue'

const props = defineProps<{ businessPhoneE164: string; instagramHandle: string }>()

const whatsappLink = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
const instagramLink = computed(() => buildInstagramProfileLink(props.instagramHandle))
</script>

<template>
  <section id="contact" class="mx-auto max-w-3xl px-4 py-16 text-center">
    <h2 class="mb-3 font-display text-2xl text-amore-gold">Let's Talk Jewelry</h2>
    <p class="mb-8 text-neutral-600">
      Have a question about a piece, custom orders, or bridal sets? Reach out — we reply personally.
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
