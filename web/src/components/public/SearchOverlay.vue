<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { pushSearchHistory, readSearchHistory, removeSearchHistory } from '../../lib/searchHistory'
import { buildSearchSuggestions, type SearchSuggestion } from '../../lib/searchSuggestions'
import { useCatalogueStore } from '../../stores/catalogue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const router = useRouter()

const query = ref('')
const history = ref<string[]>([])
const overlayRoot = ref<HTMLElement | null>(null)

function onOutsidePointerDown(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (overlayRoot.value?.contains(target)) return
  if (target instanceof Element && target.closest('[data-testid="search-toggle"]')) return
  emit('close')
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      document.removeEventListener('pointerdown', onOutsidePointerDown)
      return
    }
    query.value = ''
    history.value = readSearchHistory()
    await nextTick()
    document.addEventListener('pointerdown', onOutsidePointerDown)
    overlayRoot.value?.querySelector<HTMLInputElement>('input')?.focus()
  },
  { immediate: true },
)

onUnmounted(() => {
  document.removeEventListener('pointerdown', onOutsidePointerDown)
})

const suggestions = computed(() =>
  buildSearchSuggestions(
    {
      products: catalogue.products,
      categories: catalogue.categories,
      collections: catalogue.collections,
      styleTags: catalogue.styleTags,
    },
    query.value,
  ),
)

const showHistory = computed(() => props.open && query.value.trim().length === 0 && history.value.length > 0)

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
}

function submitSearch(rawTerm?: string) {
  const term = (rawTerm ?? query.value).trim()
  if (!term) return
  history.value = pushSearchHistory(term)
  catalogue.replaceFilters({ searchTerm: term })
  query.value = ''
  nav.goToCollection()
  emit('close')
}

function removeHistoryTerm(term: string) {
  history.value = removeSearchHistory(term)
}

function selectSuggestion(suggestion: SearchSuggestion) {
  if (suggestion.kind === 'product') {
    void router.push({ name: 'product-detail', params: { id: suggestion.id } })
    emit('close')
    return
  }
  if (suggestion.kind === 'category') {
    nav.filterByCategory(suggestion.id)
  } else if (suggestion.kind === 'collection') {
    nav.filterByCollection(suggestion.id)
  } else {
    nav.filterByStyleTag(suggestion.id)
  }
  emit('close')
}

function clearAndClose() {
  query.value = ''
  emit('close')
}
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="open"
      ref="overlayRoot"
      data-testid="search-overlay"
      class="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white px-4 py-4 shadow-lg"
    >
      <div class="mx-auto flex max-w-screen-2xl items-center gap-3">
        <label class="block flex-1">
          <span class="sr-only">Search products</span>
          <input
            type="search"
            placeholder="Search by name or keyword..."
            class="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-amore-gold"
            :value="query"
            @input="onInput"
            @keydown.enter.prevent="submitSearch()"
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

      <ul
        v-if="suggestions.length > 0"
        data-testid="search-suggestions"
        class="mx-auto mt-3 max-h-72 max-w-screen-2xl overflow-y-auto rounded-md border border-neutral-200"
      >
        <li v-for="suggestion in suggestions" :key="`${suggestion.kind}-${suggestion.id}`">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50"
            :data-testid="`search-suggestion-${suggestion.kind}-${suggestion.id}`"
            @click="selectSuggestion(suggestion)"
          >
            <span class="truncate text-neutral-900">{{ suggestion.label }}</span>
            <span class="shrink-0 text-xs text-neutral-500">{{ suggestion.typeLabel }}</span>
          </button>
        </li>
      </ul>

      <ul
        v-else-if="showHistory"
        data-testid="search-history"
        class="mx-auto mt-3 max-h-72 max-w-screen-2xl overflow-y-auto rounded-md border border-neutral-200"
      >
        <li
          v-for="term in history"
          :key="term"
          class="flex items-center gap-1 border-b border-neutral-100 last:border-b-0"
        >
          <button
            type="button"
            class="min-w-0 flex-1 px-4 py-2.5 text-left text-sm text-neutral-900 transition hover:bg-neutral-50"
            data-testid="search-history-item"
            @click="submitSearch(term)"
          >
            {{ term }}
          </button>
          <button
            type="button"
            data-testid="search-history-remove"
            :aria-label="`Remove ${term} from history`"
            class="mr-2 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            @click.stop="removeHistoryTerm(term)"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </li>
      </ul>

      <p v-else class="mx-auto mt-2 max-w-screen-2xl text-xs text-neutral-500">
        Type to see suggestions, then press Enter or choose a result.
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
