<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCatalogueStore } from '../../stores/catalogue'
import type { Product, ProductInput } from '../../types/catalogue'
import PhotoUploader from './PhotoUploader.vue'

const props = defineProps<{ editing?: Product | null }>()
const emit = defineEmits<{ saved: [] }>()

const catalogue = useCatalogueStore()

const name = ref(props.editing?.name ?? '')
const description = ref(props.editing?.description ?? '')
const price = ref(props.editing?.priceInr ?? 0)
const categoryId = ref(props.editing?.categoryId ?? catalogue.categories[0]?.id ?? '')
const photoUrls = ref<string[]>(props.editing?.photoUrls ?? [])

// Categories can still be loading (async Firestore snapshot) when the form
// first mounts; default to the first one once they arrive, unless the user
// (or edit mode) already set a value.
watch(
  () => catalogue.categories,
  (categories) => {
    if (!categoryId.value && categories.length > 0) {
      categoryId.value = categories[0].id
    }
  },
  { immediate: true },
)
const formError = ref<string | null>(null)
const isSaving = ref(false)
// Categories load asynchronously from Firestore; block saving until they've
// arrived so the form can never be submitted with a category picker that
// looks filled-in visually but hasn't actually settled yet.
const categoriesReady = computed(() => catalogue.categories.length > 0)

function validate(): string | null {
  if (!name.value.trim()) return 'Please enter a product name.'
  if (!description.value.trim()) return 'Please enter a short description.'
  if (Number(price.value) < 0 || Number.isNaN(Number(price.value))) return 'Price must be zero or more.'
  if (!categoryId.value) return 'Please choose a category.'
  if (photoUrls.value.length === 0) return 'Please add at least one photo before saving.'
  return null
}

async function onSubmit() {
  const error = validate()
  if (error) {
    formError.value = error
    return
  }
  formError.value = null
  isSaving.value = true
  try {
    const input: ProductInput = {
      name: name.value.trim(),
      description: description.value.trim(),
      priceInr: Number(price.value),
      photoUrls: photoUrls.value,
      categoryId: categoryId.value,
      styleTagIds: props.editing?.styleTagIds ?? [],
      collectionId: props.editing?.collectionId ?? null,
      isNewArrival: props.editing?.isNewArrival ?? false,
      isFounderFavourite: props.editing?.isFounderFavourite ?? false,
      isStatementPick: props.editing?.isStatementPick ?? false,
      isBridal: props.editing?.isBridal ?? false,
      styleGroup: props.editing?.styleGroup ?? null,
    }
    await catalogue.saveProduct(input, props.editing?.id)
    emit('saved')
  } catch {
    formError.value = 'Could not save this product. Please check your connection and try again.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Name</span>
      <input
        v-model="name"
        type="text"
        data-testid="product-name"
        class="w-full rounded-md border border-neutral-300 px-3 py-2"
      />
    </label>

    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Description</span>
      <textarea
        v-model="description"
        data-testid="product-description"
        class="w-full rounded-md border border-neutral-300 px-3 py-2"
      />
    </label>

    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Price (INR)</span>
      <input
        v-model.number="price"
        type="number"
        data-testid="product-price"
        class="w-full rounded-md border border-neutral-300 px-3 py-2"
      />
    </label>

    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Category</span>
      <select
        v-model="categoryId"
        data-testid="product-category"
        :disabled="!categoriesReady"
        class="w-full rounded-md border border-neutral-300 px-3 py-2 disabled:bg-neutral-100"
      >
        <option v-for="category in catalogue.categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
      <p v-if="!categoriesReady" class="mt-1 text-xs text-neutral-500">Loading categories…</p>
    </label>

    <div>
      <span class="mb-1 block text-sm text-neutral-700">Photos</span>
      <PhotoUploader v-model="photoUrls" />
    </div>

    <p v-if="formError" data-testid="form-error" class="text-sm text-red-600">{{ formError }}</p>

    <button
      type="submit"
      :disabled="isSaving || !categoriesReady"
      class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {{ isSaving ? 'Saving…' : 'Save Product' }}
    </button>
  </form>
</template>
