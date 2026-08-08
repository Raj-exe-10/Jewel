<script setup lang="ts">
import { computed } from 'vue'
import { buildGeneralEnquiryLink } from '../../composables/useWhatsAppLink'

const props = defineProps<{ businessPhoneE164: string }>()
const link = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
</script>

<template>
  <a
    :href="link"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with Amore on WhatsApp"
    class="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg"
  >
    <span aria-hidden="true" class="text-2xl">💬</span>
  </a>
</template>
