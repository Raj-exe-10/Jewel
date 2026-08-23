<script setup lang="ts">
import { ref, watch } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { useCollectionPageStore } from '../../stores/collectionPage'

const collectionPage = useCollectionPageStore()
const productsPerRow = ref(String(collectionPage.productsPerRow))
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isSaving = ref(false)

collectionPage.subscribeToConfig()

watch(
  () => collectionPage.productsPerRow,
  (value) => {
    productsPerRow.value = String(value)
  },
)

async function onSave() {
  const value = Number(productsPerRow.value)
  errorMessage.value = null
  successMessage.value = null
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    errorMessage.value = 'Enter a whole number from 1 to 10.'
    return
  }

  isSaving.value = true
  try {
    await collectionPage.saveProductsPerRow(value)
    successMessage.value = 'Collection row limit saved.'
  } catch {
    errorMessage.value = 'Could not save the collection row limit. Please try again.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <h1 class="mb-2 font-display text-3xl text-neutral-900">Catalogue settings</h1>
    <p class="mb-6 text-sm text-neutral-600">
      Control how many products are grouped into each horizontal row on Shop the Collection.
    </p>

    <p v-if="errorMessage" class="mb-4 text-sm text-red-600" data-testid="catalogue-settings-error">
      {{ errorMessage }}
    </p>
    <p
      v-if="successMessage"
      class="mb-4 text-sm text-emerald-700"
      data-testid="catalogue-settings-success"
    >
      {{ successMessage }}
    </p>

    <form
      class="max-w-xl space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
      @submit.prevent="onSave"
    >
      <label class="block text-sm">
        <span class="mb-1 block text-neutral-700">Products per carousel row</span>
        <input
          v-model="productsPerRow"
          data-testid="products-per-row"
          type="number"
          min="1"
          max="10"
          step="1"
          class="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        data-testid="save-catalogue-settings"
        class="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Saving…' : 'Save' }}
      </button>
    </form>
  </AdminLayout>
</template>
