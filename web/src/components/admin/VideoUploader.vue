<script setup lang="ts">
import { PaperClipIcon } from '@heroicons/vue/24/outline'
import { reactive, ref } from 'vue'
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { storage } from '../../firebase/config'
import type { SectionVideo } from '../../types/homepage'
import PhotoUploader from './PhotoUploader.vue'

const props = defineProps<{ modelValue: SectionVideo[]; sectionId: string }>()
const emit = defineEmits<{ 'update:modelValue': [videos: SectionVideo[]] }>()

const isUploading = ref(false)
const uploadError = ref<string | null>(null)
const loadErrors = reactive<Record<string, boolean>>({})
const fileInput = ref<HTMLInputElement | null>(null)

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0) return

  isUploading.value = true
  uploadError.value = null
  try {
    const uploaded: SectionVideo[] = []
    for (const [offset, file] of files.entries()) {
      const id = `${Date.now()}-${offset}`
      const path = `section-videos/${props.sectionId}/${id}-${file.name}`
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, file, { contentType: file.type || 'video/mp4' })
      uploaded.push({
        id,
        label: file.name.replace(/\.[^.]+$/, ''),
        posterUrl: '',
        videoUrl: await getDownloadURL(fileRef),
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

function updateLabel(id: string, label: string) {
  emit(
    'update:modelValue',
    props.modelValue.map((video) => (video.id === id ? { ...video, label } : video)),
  )
}

function setPoster(id: string, urls: string[]) {
  emit(
    'update:modelValue',
    props.modelValue.map((video) => (video.id === id ? { ...video, posterUrl: urls[urls.length - 1] ?? '' } : video)),
  )
}

async function removeVideo(video: SectionVideo) {
  try {
    if (video.videoUrl.includes('firebasestorage') || video.videoUrl.includes('127.0.0.1')) {
      await deleteObject(storageRef(storage, video.videoUrl))
    }
  } catch {
    // Best-effort cleanup; the Firestore document still drops the entry.
  }
  delete loadErrors[video.id]
  emit(
    'update:modelValue',
    props.modelValue.filter((item) => item.id !== video.id),
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
    copy.map((video, sortOrder) => ({ ...video, sortOrder })),
  )
}

function onVideoError(id: string) {
  loadErrors[id] = true
}

function openFilePicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div>
    <ul v-if="modelValue.length" class="mb-3 space-y-3">
      <li
        v-for="(video, index) in modelValue"
        :key="video.id"
        class="rounded-lg border border-neutral-200 bg-white p-3"
        data-testid="video-item"
      >
        <video
          v-show="!loadErrors[video.id]"
          data-testid="video-preview"
          :src="video.videoUrl"
          :poster="video.posterUrl || undefined"
          class="mb-2 h-32 w-full rounded object-cover"
          muted
          controls
          playsinline
          preload="metadata"
          @error="onVideoError(video.id)"
        />
        <div
          v-if="loadErrors[video.id]"
          data-testid="video-load-error"
          class="mb-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
        >
          <p>Video couldn’t load. You can still edit the label, poster, or replace it.</p>
          <p class="mt-1 break-all text-amber-700/80">{{ video.videoUrl }}</p>
        </div>
        <input
          :value="video.label"
          data-testid="video-label"
          class="mb-2 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          @input="updateLabel(video.id, ($event.target as HTMLInputElement).value)"
        />
        <p class="mb-1 text-xs text-neutral-500">Poster image (optional)</p>
        <PhotoUploader
          :model-value="video.posterUrl ? [video.posterUrl] : []"
          :folder="`section-media/${sectionId}/posters`"
          alt="Poster image"
          @update:model-value="(urls) => setPoster(video.id, urls)"
        />
        <div class="mt-2 flex gap-2">
          <button type="button" class="rounded-md border px-2 py-1 text-xs" @click="move(index, -1)">Up</button>
          <button type="button" class="rounded-md border px-2 py-1 text-xs" @click="move(index, 1)">Down</button>
          <button
            type="button"
            data-testid="remove-video"
            class="ml-auto rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
            @click="removeVideo(video)"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>

    <input
      ref="fileInput"
      type="file"
      accept="video/mp4,video/webm"
      multiple
      data-testid="video-input"
      class="sr-only"
      @change="onFilesSelected"
    />
    <button
      type="button"
      data-testid="video-attach-button"
      class="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-800"
      @click="openFilePicker"
    >
      <PaperClipIcon class="h-4 w-4" aria-hidden="true" />
      {{ modelValue.length ? 'Add more videos' : 'Add videos' }}
    </button>
    <p v-if="isUploading" class="mt-1 text-xs text-neutral-500">Uploading video…</p>
    <p v-if="uploadError" class="mt-1 text-xs text-red-600" data-testid="video-upload-error">{{ uploadError }}</p>
  </div>
</template>
