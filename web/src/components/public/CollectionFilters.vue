<script setup lang="ts">
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()

function scrollToProductsOnMobile() {
  if (typeof window === 'undefined') return
  if (!window.matchMedia('(max-width: 1023px)').matches) return
  document.getElementById('collection-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function matchesSearchTerm(name: string): boolean {
  const term = catalogue.filters.searchTerm.trim().toLowerCase()
  if (term.length < 2) return false
  const n = name.toLowerCase()
  return n.includes(term) || term.includes(n)
}

function isCategoryActive(categoryId: string, name: string): boolean {
  if (catalogue.filters.categoryId !== null) {
    return catalogue.filters.categoryId === categoryId
  }
  return matchesSearchTerm(name)
}

function isStyleActive(styleTagId: string, name: string): boolean {
  if (catalogue.filters.styleTagId !== null) {
    return catalogue.filters.styleTagId === styleTagId
  }
  return matchesSearchTerm(name)
}

function isCollectionActive(collectionId: string, name: string): boolean {
  if (catalogue.filters.collectionId !== null) {
    return catalogue.filters.collectionId === collectionId
  }
  if (catalogue.filters.isBridal === true) {
    return false
  }
  return matchesSearchTerm(name)
}

function isBridalActive(): boolean {
  if (catalogue.filters.isBridal === true) {
    return true
  }
  if (catalogue.filters.collectionId !== null) {
    return false
  }
  return matchesSearchTerm('Bridal / Wedding') || matchesSearchTerm('bridal')
}

function toggleCategory(categoryId: string) {
  if (catalogue.filters.categoryId === categoryId) {
    catalogue.setFilters({ categoryId: null })
  } else {
    // Combine with other dimensions; clear search so soft name-highlight does not fight the chip.
    catalogue.setFilters({ categoryId, searchTerm: '' })
  }
  scrollToProductsOnMobile()
}

function toggleStyle(styleTagId: string) {
  if (catalogue.filters.styleTagId === styleTagId) {
    catalogue.setFilters({ styleTagId: null })
  } else {
    catalogue.setFilters({ styleTagId, searchTerm: '' })
  }
  scrollToProductsOnMobile()
}

function toggleCollection(collectionId: string) {
  if (catalogue.filters.collectionId === collectionId) {
    catalogue.setFilters({ collectionId: null })
  } else {
    // Bridal chip and a named collection are mutually exclusive.
    catalogue.setFilters({ collectionId, isBridal: null, searchTerm: '' })
  }
  scrollToProductsOnMobile()
}

function toggleBridal() {
  if (catalogue.filters.isBridal === true) {
    catalogue.setFilters({ isBridal: null })
  } else {
    catalogue.setFilters({ isBridal: true, collectionId: null, searchTerm: '' })
  }
  scrollToProductsOnMobile()
}

const chipBase = 'shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors'
const chipActive = 'border-amore-gold bg-amore-gold text-white'
const chipIdle = 'border-neutral-300 text-neutral-700 hover:border-amore-charcoal hover:text-amore-charcoal'
const chipRow = 'flex flex-nowrap gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]'
</script>

<template>
  <div class="space-y-4" data-testid="collection-filters">
    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Categories</p>
      <div :class="chipRow" role="group" aria-label="Filter by category">
        <button
          v-for="category in catalogue.categories"
          :key="category.id"
          type="button"
          :data-testid="`filter-chip-${category.id}`"
          :aria-pressed="isCategoryActive(category.id, category.name)"
          :class="[chipBase, isCategoryActive(category.id, category.name) ? chipActive : chipIdle]"
          @click="toggleCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <div v-if="catalogue.styleTags.length > 0">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Styles / Labels</p>
      <div :class="chipRow" role="group" aria-label="Filter by style">
        <button
          v-for="tag in catalogue.styleTags"
          :key="tag.id"
          type="button"
          :data-testid="`style-chip-${tag.id}`"
          :aria-pressed="isStyleActive(tag.id, tag.name)"
          :class="[chipBase, isStyleActive(tag.id, tag.name) ? chipActive : chipIdle]"
          @click="toggleStyle(tag.id)"
        >
          {{ tag.name }}
        </button>
      </div>
    </div>

    <div>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Collections</p>
      <div :class="chipRow" role="group" aria-label="Filter by collection">
        <button
          v-for="collection in catalogue.collections"
          :key="collection.id"
          type="button"
          :data-testid="`collection-chip-${collection.id}`"
          :aria-pressed="isCollectionActive(collection.id, collection.name)"
          :class="[chipBase, isCollectionActive(collection.id, collection.name) ? chipActive : chipIdle]"
          @click="toggleCollection(collection.id)"
        >
          {{ collection.name }}
        </button>
        <button
          type="button"
          data-testid="bridal-filter"
          :aria-pressed="isBridalActive()"
          :class="[chipBase, isBridalActive() ? chipActive : chipIdle]"
          @click="toggleBridal"
        >
          Bridal / Wedding
        </button>
      </div>
    </div>
  </div>
</template>
