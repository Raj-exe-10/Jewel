<script setup lang="ts">
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()

function onInput(event: Event) {
  catalogue.setFilters({ searchTerm: (event.target as HTMLInputElement).value })
}
</script>

<template>
  <label class="block">
    <span class="sr-only">Search products</span>
    <input
      type="search"
      placeholder="Search by name or keyword..."
      class="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm"
      :value="catalogue.filters.searchTerm"
      @input="onInput"
    />
  </label>
</template>
