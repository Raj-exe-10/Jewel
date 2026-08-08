<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import SearchBox from './SearchBox.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="open"
      data-testid="search-overlay"
      class="absolute inset-x-0 top-full z-30 border-b border-neutral-200 bg-white px-4 py-4 shadow-lg"
    >
      <div class="mx-auto flex max-w-6xl items-center gap-3">
        <div class="flex-1">
          <SearchBox />
        </div>
        <button
          type="button"
          data-testid="search-overlay-close"
          aria-label="Close search"
          class="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          @click="emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
