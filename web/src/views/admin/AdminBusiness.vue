<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { useBusinessStore, type BusinessProfile } from '../../stores/business'
import { useHomepageStore } from '../../stores/homepage'
import { toSectionInput } from '../../data/defaultSections'
import type { StudioLocationContent } from '../../types/homepage'

const business = useBusinessStore()
const homepage = useHomepageStore()

const whatsappNumberE164 = ref('')
const instagramHandle = ref('')
const address = ref('')
const mapUrl = ref('')
const isSaving = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

function syncFromStore() {
  whatsappNumberE164.value = business.whatsappNumberE164
  instagramHandle.value = business.instagramHandle
  address.value = business.address
  mapUrl.value = business.mapUrl
}

onMounted(() => {
  business.subscribeToProfile()
  homepage.subscribeToSections()
  syncFromStore()
})

watch(
  () => business.loaded,
  (loaded) => {
    if (loaded) syncFromStore()
  },
)

async function syncStudioSection(profile: BusinessProfile) {
  const studio = homepage.sections.find((section) => section.type === 'studio_location')
  if (!studio) return
  const content = { ...(studio.content as StudioLocationContent) }
  content.address = profile.address
  if (profile.mapUrl) content.mapUrl = profile.mapUrl
  await homepage.saveSection(toSectionInput({ ...studio, content }), studio.id)
}

async function onSave() {
  errorMessage.value = null
  successMessage.value = null
  isSaving.value = true
  try {
    const payload: BusinessProfile = {
      whatsappNumberE164: whatsappNumberE164.value,
      instagramHandle: instagramHandle.value,
      address: address.value,
      mapUrl: mapUrl.value,
    }
    await business.saveProfile(payload)
    await syncStudioSection(payload)
    successMessage.value = 'Business contact saved.'
  } catch {
    errorMessage.value = 'Could not save business contact. Please try again.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <h1 class="mb-2 font-display text-3xl text-neutral-900">Business contact</h1>
    <p class="mb-6 text-sm text-neutral-600">
      WhatsApp, Instagram, and studio address used across the public site.
    </p>

    <p v-if="errorMessage" class="mb-4 text-sm text-red-600" data-testid="business-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="mb-4 text-sm text-emerald-700" data-testid="business-success">{{ successMessage }}</p>

    <form class="max-w-xl space-y-4 rounded-lg border border-neutral-200 bg-white p-6" @submit.prevent="onSave">
      <label class="block text-sm">
        <span class="mb-1 block text-neutral-700">WhatsApp number (digits only, with country code)</span>
        <input
          v-model="whatsappNumberE164"
          data-testid="business-whatsapp"
          type="text"
          class="w-full rounded-md border border-neutral-300 px-3 py-2"
          placeholder="919999999999"
        />
      </label>
      <label class="block text-sm">
        <span class="mb-1 block text-neutral-700">Instagram handle</span>
        <input
          v-model="instagramHandle"
          data-testid="business-instagram"
          type="text"
          class="w-full rounded-md border border-neutral-300 px-3 py-2"
          placeholder="amore.jewelry"
        />
      </label>
      <label class="block text-sm">
        <span class="mb-1 block text-neutral-700">Studio address</span>
        <textarea
          v-model="address"
          data-testid="business-address"
          rows="3"
          class="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label class="block text-sm">
        <span class="mb-1 block text-neutral-700">Map URL (optional)</span>
        <input
          v-model="mapUrl"
          data-testid="business-map-url"
          type="url"
          class="w-full rounded-md border border-neutral-300 px-3 py-2"
          placeholder="https://maps.google.com/..."
        />
      </label>
      <button
        type="submit"
        data-testid="business-save"
        class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Saving…' : 'Save' }}
      </button>
    </form>
  </AdminLayout>
</template>
