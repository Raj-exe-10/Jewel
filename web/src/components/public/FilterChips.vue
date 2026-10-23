<script setup lang="ts">
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()

function toggleCategory(categoryId: string) {
  if (catalogue.filters.categoryId === categoryId) {
    catalogue.setFilters({ categoryId: null })
  } else {
    catalogue.setFilters({ categoryId, searchTerm: '' })
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
    <button
      v-for="category in catalogue.categories"
      :key="category.id"
      type="button"
      :data-testid="`filter-chip-${category.id}`"
      :aria-pressed="catalogue.filters.categoryId === category.id"
      class="rounded-full border px-4 py-1.5 text-sm transition-colors"
      :class="
        catalogue.filters.categoryId === category.id
          ? 'border-amore-gold bg-amore-gold text-white'
          : 'border-neutral-300 text-neutral-700 hover:border-amore-charcoal hover:text-amore-charcoal'
      "
      @click="toggleCategory(category.id)"
    >
      {{ category.name }}
    </button>
  </div>
</template>
