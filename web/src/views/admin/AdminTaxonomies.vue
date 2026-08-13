<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import CategoryManager from '../../components/admin/CategoryManager.vue'
import { useCatalogueStore } from '../../stores/catalogue'

const catalogue = useCatalogueStore()
const taxonomyError = ref<string | null>(null)
const collapsedOnce = ref(false)

onMounted(() => {
  catalogue.subscribeToCatalogue()
})

watch(
  () => catalogue.categories.length + catalogue.collections.length + catalogue.styleTags.length,
  async (total) => {
    if (collapsedOnce.value || total === 0) return
    collapsedOnce.value = true
    try {
      await catalogue.collapseDuplicateTaxonomies()
    } catch {
      // Non-fatal: staff can still manage taxonomies manually.
    }
  },
)

type TaxonomyName = 'categories' | 'collections' | 'styleTags'

async function addTaxonomy(taxonomy: TaxonomyName, name: string) {
  taxonomyError.value = null
  try {
    await catalogue.addTaxonomyEntry(taxonomy, name)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    taxonomyError.value = /already exists/i.test(message)
      ? message
      : 'Could not add that. Please check your connection and try again.'
  }
}

async function removeTaxonomy(taxonomy: TaxonomyName, id: string) {
  taxonomyError.value = null
  try {
    await catalogue.removeTaxonomyEntry(taxonomy, id)
  } catch {
    taxonomyError.value = "That can't be removed right now. Please refresh and try again."
  }
}
</script>

<template>
  <AdminLayout>
    <h1 class="mb-6 font-display text-3xl text-neutral-900">Taxonomies</h1>
    <p v-if="taxonomyError" class="mb-4 text-sm text-red-600">{{ taxonomyError }}</p>
    <section class="grid gap-6 sm:grid-cols-3">
      <CategoryManager
        :items="catalogue.categories"
        label="Category"
        :is-referenced="(id) => catalogue.isTaxonomyReferenced('categories', id)"
        @add="(name) => addTaxonomy('categories', name)"
        @remove="(id) => removeTaxonomy('categories', id)"
      />
      <CategoryManager
        :items="catalogue.collections"
        label="Collection"
        :is-referenced="(id) => catalogue.isTaxonomyReferenced('collections', id)"
        @add="(name) => addTaxonomy('collections', name)"
        @remove="(id) => removeTaxonomy('collections', id)"
      />
      <CategoryManager
        :items="catalogue.styleTags"
        label="Style Tag"
        :is-referenced="(id) => catalogue.isTaxonomyReferenced('styleTags', id)"
        @add="(name) => addTaxonomy('styleTags', name)"
        @remove="(id) => removeTaxonomy('styleTags', id)"
      />
    </section>
  </AdminLayout>
</template>
