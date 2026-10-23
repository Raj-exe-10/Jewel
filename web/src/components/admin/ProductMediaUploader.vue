<script setup lang="ts">
import { PaperClipIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { useImageCompression } from '../../composables/useImageCompression'
import { deletePublicUrl, isManagedStorageUrl, uploadPublicFile } from '../../supabase/storage'
import type { ProductMediaItem } from '../../lib/productMedia'

const props = defineProps<{ modelValue: ProductMediaItem[]; productId: string }>()
const emit = defineEmits<{ 'update:modelValue': [items: ProductMediaItem[]] }>()

const { compress } = useImageCompression()
const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const videoInput = ref<HTMLInputElement | null>(null)

async function onImagesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0) return
  if (files.some((file) => !file.type.startsWith('image/'))) {
    uploadError.value = 'Please choose image files only (JPEG, PNG, WebP, GIF, or AVIF).'
    input.value = ''
    return
  }
  isUploading.value = true
  uploadError.value = null
  try {
    const uploaded: ProductMediaItem[] = []
    for (const [offset, file] of files.entries()) {
      const compressed = await compress(file)
      const id = `img-${Date.now()}-${offset}`
      const fileName = `${props.productId}/${id}-${file.name}`
      const url = await uploadPublicFile('product-photos', fileName, compressed, compressed.type)
      uploaded.push({
        id,
        kind: 'image',
        url,
        sortOrder: props.modelValue.length + offset,
      })
    }
    emit('update:modelValue', [...props.modelValue, ...uploaded])
  } catch {
    uploadError.value = 'Could not upload one or more photos. Please try again.'
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

async function onVideosSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0) return
  if (files.some((file) => file.type !== 'video/mp4' && file.type !== 'video/webm')) {
    uploadError.value = 'Please choose MP4 or WebM video files only.'
    input.value = ''
    return
  }
  isUploading.value = true
  uploadError.value = null
  try {
    const uploaded: ProductMediaItem[] = []
    for (const [offset, file] of files.entries()) {
      const id = `vid-${Date.now()}-${offset}`
      const fileName = `${props.productId}/${id}-${file.name}`
      const url = await uploadPublicFile('product-videos', fileName, file, file.type || 'video/mp4')
      uploaded.push({
        id,
        kind: 'video',
        url,
        posterUrl: '',
        sortOrder: props.modelValue.length + offset,
      })
    }
    emit('update:modelValue', [...props.modelValue, ...uploaded])
  } catch {
    uploadError.value = 'Could not upload one or more videos. Please try a smaller MP4 file.'
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

async function removeItem(item: ProductMediaItem) {
  try {
    if (isManagedStorageUrl(item.url)) {
      await deletePublicUrl(item.url)
    }
  } catch {
    // Best-effort cleanup.
  }
  emit(
    'update:modelValue',
    props.modelValue
      .filter((entry) => entry.id !== item.id)
      .map((entry, sortOrder) => ({ ...entry, sortOrder })),
  )
}

function move(index: number, direction: -1 | 1) {
  const next = index + direction
  if (next < 0 || next >= props.modelValue.length) return
  const copy = [...props.modelValue]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item!)
  emit(
    'update:modelValue',
    copy.map((entry, sortOrder) => ({ ...entry, sortOrder })),
  )
}
</script>

<template>
  <div>
    <ul v-if="modelValue.length" class="mb-3 space-y-3">
      <li
        v-for="(item, index) in modelValue"
        :key="item.id"
        class="rounded-lg border border-neutral-200 bg-white p-3"
        data-testid="media-item"
      >
        <img
          v-if="item.kind === 'image'"
          :src="item.url"
          alt="Product media"
          class="mb-2 h-32 w-full rounded object-cover"
        />
        <video
          v-else
          :src="item.url"
          :poster="item.posterUrl || undefined"
          class="mb-2 h-32 w-full rounded object-cover"
          controls
          playsinline
          muted
          preload="metadata"
        />
        <p class="mb-2 text-xs uppercase tracking-wide text-neutral-500">{{ item.kind }}</p>
        <div class="flex gap-2">
          <button type="button" class="rounded-md border px-2 py-1 text-xs" @click="move(index, -1)">Up</button>
          <button type="button" class="rounded-md border px-2 py-1 text-xs" @click="move(index, 1)">Down</button>
          <button
            type="button"
            data-testid="remove-media"
            class="ml-auto rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
            @click="removeItem(item)"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>

    <div class="flex flex-wrap gap-2">
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        multiple
        data-testid="media-image-input"
        class="sr-only"
        @change="onImagesSelected"
      />
      <input
        ref="videoInput"
        type="file"
        accept="video/mp4,video/webm"
        multiple
        data-testid="media-video-input"
        class="sr-only"
        @change="onVideosSelected"
      />
      <button
        type="button"
        data-testid="add-images-button"
        class="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        @click="imageInput?.click()"
      >
        <PaperClipIcon class="h-4 w-4" aria-hidden="true" />
        {{ modelValue.some((item) => item.kind === 'image') ? 'Add more photos' : 'Add photos' }}
      </button>
      <button
        type="button"
        data-testid="add-videos-button"
        class="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        @click="videoInput?.click()"
      >
        <PaperClipIcon class="h-4 w-4" aria-hidden="true" />
        {{ modelValue.some((item) => item.kind === 'video') ? 'Add more videos' : 'Add videos' }}
      </button>
    </div>
    <p v-if="isUploading" class="mt-1 text-xs text-neutral-500">Uploading…</p>
    <p v-if="uploadError" class="mt-1 text-xs text-red-600" data-testid="media-upload-error">{{ uploadError }}</p>
  </div>
</template>
