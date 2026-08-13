<script setup lang="ts">
import { PaperClipIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { useImageCompression } from '../../composables/useImageCompression'
import { storage } from '../../firebase/config'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

const props = withDefaults(defineProps<{ modelValue: string[]; folder?: string; alt?: string }>(), {
  folder: 'product-photos',
  alt: 'Product photo',
})
const emit = defineEmits<{ 'update:modelValue': [urls: string[]] }>()

const { compress } = useImageCompression()
const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0) return

  isUploading.value = true
  uploadError.value = null
  try {
    const uploadedUrls: string[] = []
    for (const file of files) {
      const compressed = await compress(file)
      const path = `${props.folder}/${Date.now()}-${file.name}`
      const ref = storageRef(storage, path)
      await uploadBytes(ref, compressed, { contentType: compressed.type })
      uploadedUrls.push(await getDownloadURL(ref))
    }
    emit('update:modelValue', [...props.modelValue, ...uploadedUrls])
  } catch {
    uploadError.value = 'Could not upload one or more photos. Please check your connection and try again.'
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

function removePhoto(url: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((u) => u !== url),
  )
}

function openFilePicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div>
    <div v-if="modelValue.length" class="mb-3 flex flex-wrap gap-2">
      <div v-for="url in modelValue" :key="url" class="relative">
        <img :src="url" class="h-20 w-20 rounded object-cover" :alt="alt" />
        <button
          type="button"
          class="absolute -right-1 -top-1 rounded-full bg-white px-1.5 text-xs shadow"
          @click="removePhoto(url)"
        >
          ✕
        </button>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      multiple
      data-testid="photo-input"
      class="sr-only"
      @change="onFilesSelected"
    />
    <button
      type="button"
      data-testid="photo-attach-button"
      class="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
      @click="openFilePicker"
    >
      <PaperClipIcon class="h-4 w-4" aria-hidden="true" />
      {{ modelValue.length ? 'Add more photos' : 'Add photos' }}
    </button>

    <p v-if="isUploading" class="mt-1 text-xs text-neutral-500">Uploading…</p>
    <p v-if="uploadError" class="mt-1 text-xs text-red-600" data-testid="upload-error">{{ uploadError }}</p>
  </div>
</template>
