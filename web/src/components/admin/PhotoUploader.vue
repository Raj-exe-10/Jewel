<script setup lang="ts">
import { ref } from 'vue'
import { useImageCompression } from '../../composables/useImageCompression'
import { storage } from '../../firebase/config'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [urls: string[]] }>()

const { compress } = useImageCompression()
const isUploading = ref(false)
const uploadError = ref<string | null>(null)

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
      const path = `product-photos/${Date.now()}-${file.name}`
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
</script>

<template>
  <div>
    <div v-if="modelValue.length" class="mb-3 flex flex-wrap gap-2">
      <div v-for="url in modelValue" :key="url" class="relative">
        <img :src="url" class="h-20 w-20 rounded object-cover" alt="Product photo" />
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
      type="file"
      accept="image/*"
      capture="environment"
      multiple
      data-testid="photo-input"
      @change="onFilesSelected"
    />

    <p v-if="isUploading" class="mt-1 text-xs text-neutral-500">Uploading…</p>
    <p v-if="uploadError" class="mt-1 text-xs text-red-600" data-testid="upload-error">{{ uploadError }}</p>
  </div>
</template>
