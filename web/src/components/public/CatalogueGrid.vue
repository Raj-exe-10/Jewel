<script setup lang="ts">
import { computed } from 'vue'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection } from '../../types/homepage'
import FilterChips from './FilterChips.vue'
import ProductCard from './ProductCard.vue'
import SearchBox from './SearchBox.vue'
import SectionHeading from './SectionHeading.vue'

const props = defineProps<{ businessPhoneE164: string; section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('catalogue'))

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

const hasResults = computed(() => catalogue.filteredProducts.length > 0)
</script>

<template>
  <section :id="resolved.anchorId || 'catalogue'" class="mx-auto max-w-6xl px-4 py-12">
    <SectionHeading :title="resolved.title" :subtitle="resolved.subtitle" :icon="resolved.icon" />

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
