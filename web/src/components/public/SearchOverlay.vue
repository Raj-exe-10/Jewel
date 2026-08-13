<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { useCatalogueStore } from '../../stores/catalogue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    await nextTick()
    const input = document.querySelector<HTMLInputElement>('[data-testid="search-overlay"] input')
    input?.focus()
  },
)

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  catalogue.setFilters({ searchTerm: value })
  if (value.trim().length > 0) {
    nav.scrollToCatalogue()
  }
}

function clearAndClose() {
  catalogue.setFilters({ searchTerm: '' })
  emit('close')
}
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="open"
      data-testid="search-overlay"
      class="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white px-4 py-4 shadow-lg"
    >
      <div class="mx-auto flex max-w-6xl items-center gap-3">
        <label class="block flex-1">
          <span class="sr-only">Search products</span>
          <input
            type="search"
            placeholder="Search by name or keyword..."
            class="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-amore-gold"
            :value="catalogue.filters.searchTerm"
            @input="onInput"
            @keydown.enter.prevent="nav.scrollToCatalogue()"
          />
        </label>
        <button
          type="button"
          data-testid="search-overlay-close"
          aria-label="Close search"
          class="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          @click="clearAndClose"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <p class="mx-auto mt-2 max-w-6xl text-xs text-neutral-500">
        Results update live in the catalogue below.
      </p>
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
