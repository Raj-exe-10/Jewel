<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { pushSearchHistory, readSearchHistory, removeSearchHistory } from '../../lib/searchHistory'
import { buildSearchSuggestions, type SearchSuggestion } from '../../lib/searchSuggestions'
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const router = useRouter()

const query = ref(catalogue.filters.searchTerm)
const history = ref<string[]>([])
const isFocused = ref(false)
const rootEl = ref<HTMLElement | null>(null)

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

const showHistory = computed(() => isFocused.value && query.value.trim().length === 0 && history.value.length > 0)
const showPanel = computed(
  () => isFocused.value && (suggestions.value.length > 0 || showHistory.value),
)

watch(
  () => catalogue.filters.searchTerm,
  (term) => {
    if (!isFocused.value) {
      query.value = term
    }
  },
)

function refreshHistory() {
  history.value = readSearchHistory()
}

function onInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
}

function onFocus() {
  isFocused.value = true
  refreshHistory()
}

function submitSearch(rawTerm?: string) {
  const term = (rawTerm ?? query.value).trim()
  if (!term) return
  history.value = pushSearchHistory(term)
  catalogue.replaceFilters({ searchTerm: term })
  query.value = term
  isFocused.value = false
  nav.scrollToCollectionProducts()
}

function removeHistoryTerm(term: string) {
  history.value = removeSearchHistory(term)
}

function selectSuggestion(suggestion: SearchSuggestion) {
  if (suggestion.kind === 'product') {
    void router.push({ name: 'product-detail', params: { id: suggestion.id } })
    isFocused.value = false
    return
  }

  const label = suggestion.label
  history.value = pushSearchHistory(label)
  query.value = label
  isFocused.value = false

  if (suggestion.kind === 'category') {
    catalogue.replaceFilters({ categoryId: suggestion.id, searchTerm: label })
  } else if (suggestion.kind === 'collection') {
    catalogue.replaceFilters({ collectionId: suggestion.id, searchTerm: label })
  } else {
    catalogue.replaceFilters({ styleTagId: suggestion.id, searchTerm: label })
  }
  nav.scrollToCollectionProducts()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!rootEl.value) return
  if (event.target instanceof Node && rootEl.value.contains(event.target)) return
  isFocused.value = false
}

onMounted(() => {
  query.value = catalogue.filters.searchTerm
  refreshHistory()
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div ref="rootEl" class="relative" data-testid="collection-search">
    <label class="block">
      <span class="sr-only">Search products</span>
      <input
        type="search"
        placeholder="Search by name or keyword..."
        class="w-full rounded-md border border-amore-header/40 px-4 py-2 text-sm text-amore-charcoal placeholder:text-neutral-500"
        :value="query"
        @input="onInput"
        @focus="onFocus"
        @keydown.enter.prevent="submitSearch()"
      />
    </label>

    <div
      v-if="showPanel"
      class="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-neutral-200 bg-white shadow-lg"
    >
      <ul v-if="suggestions.length > 0" data-testid="search-suggestions">
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

      <ul v-else-if="showHistory" data-testid="search-history">
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
    </div>
  </div>
</template>
