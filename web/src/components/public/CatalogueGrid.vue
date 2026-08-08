<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogueStore } from '../../stores/catalogue'
import FilterChips from './FilterChips.vue'
import ProductCard from './ProductCard.vue'
import SearchBox from './SearchBox.vue'

defineProps<{ businessPhoneE164: string }>()

const catalogue = useCatalogueStore()

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

const hasResults = computed(() => catalogue.filteredProducts.length > 0)
</script>

<template>
  <section id="catalogue" class="mx-auto max-w-6xl px-4 py-12">
    <h2 class="mb-6 font-display text-2xl">Shop the Collection</h2>

    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <FilterChips />
      <div class="sm:w-72"><SearchBox /></div>
    </div>

    <p v-if="!hasResults" data-testid="empty-state" class="py-16 text-center text-neutral-500">
      No products found. Try a different category or search term.
    </p>

    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <ProductCard
        v-for="product in catalogue.filteredProducts"
        :key="product.id"
        :product="product"
        :category-name="categoryNameFor(product.categoryId)"
        :business-phone-e164="businessPhoneE164"
      />
    </div>
  </section>
</template>
