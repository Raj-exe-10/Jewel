<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mediaFromProduct, photoUrlsFromMedia } from '../../lib/productMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import type { Product, ProductInput, ProductMediaItem, StyleGroup } from '../../types/catalogue'
import ProductMediaUploader from './ProductMediaUploader.vue'

const props = defineProps<{ editing?: Product | null }>()
const emit = defineEmits<{ saved: [] }>()

const catalogue = useCatalogueStore()

const name = ref(props.editing?.name ?? '')
const description = ref(props.editing?.description ?? '')
const price = ref(props.editing?.priceInr ?? 0)
const categoryId = ref(props.editing?.categoryId ?? catalogue.categories[0]?.id ?? '')
const collectionId = ref(props.editing?.collectionId ?? '')
const styleTagIds = ref<string[]>([...(props.editing?.styleTagIds ?? [])])
const media = ref<ProductMediaItem[]>(mediaFromProduct(props.editing ?? { photoUrls: [] }))
const isNewArrival = ref(props.editing?.isNewArrival ?? false)
const isFounderFavourite = ref(props.editing?.isFounderFavourite ?? false)
const isStatementPick = ref(props.editing?.isStatementPick ?? false)
const isBridal = ref(props.editing?.isBridal ?? false)
const styleGroup = ref<StyleGroup | ''>(props.editing?.styleGroup ?? '')

const mediaFolderId = computed(() => props.editing?.id ?? 'draft')

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
const categoriesReady = computed(() => catalogue.categories.length > 0)

function toggleStyleTag(id: string) {
  if (styleTagIds.value.includes(id)) {
    styleTagIds.value = styleTagIds.value.filter((tagId) => tagId !== id)
    return
  }
  styleTagIds.value = [...styleTagIds.value, id]
}

function validate(): string | null {
  if (!name.value.trim()) return 'Please enter a product name.'
  if (!description.value.trim()) return 'Please enter a short description.'
  if (Number(price.value) < 0 || Number.isNaN(Number(price.value))) return 'Price must be zero or more.'
  if (!categoryId.value) return 'Please choose a category.'
  if (media.value.length === 0) return 'Please add at least one photo or video before saving.'
  return null
}

async function onSubmit() {
  if (isSaving.value) return
  const error = validate()
  if (error) {
    formError.value = error
    return
  }
  formError.value = null
  isSaving.value = true
  try {
    const orderedMedia = media.value.map((item, sortOrder) => ({ ...item, sortOrder }))
    const imageUrls = photoUrlsFromMedia(orderedMedia)
    const input: ProductInput = {
      name: name.value.trim(),
      description: description.value.trim(),
      priceInr: Number(price.value),
      photoUrls: imageUrls.length > 0 ? imageUrls : orderedMedia.map((item) => item.posterUrl || item.url),
      media: orderedMedia,
      categoryId: categoryId.value,
      styleTagIds: styleTagIds.value,
      collectionId: collectionId.value || null,
      isNewArrival: isNewArrival.value,
      isFounderFavourite: isFounderFavourite.value,
      isStatementPick: isStatementPick.value,
      isBridal: isBridal.value,
      styleGroup: styleGroup.value || null,
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

    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Collection</span>
      <select v-model="collectionId" data-testid="product-collection" class="w-full rounded-md border border-neutral-300 px-3 py-2">
        <option value="">None</option>
        <option v-for="collection in catalogue.collections" :key="collection.id" :value="collection.id">
          {{ collection.name }}
        </option>
      </select>
    </label>

    <fieldset class="text-sm">
      <legend class="mb-1 text-neutral-700">Style tags</legend>
      <div class="flex flex-wrap gap-3">
        <label v-for="tag in catalogue.styleTags" :key="tag.id" class="inline-flex items-center gap-2">
          <input
            type="checkbox"
            :checked="styleTagIds.includes(tag.id)"
            :data-testid="`product-style-${tag.id}`"
            @change="toggleStyleTag(tag.id)"
          />
          {{ tag.name }}
        </label>
      </div>
    </fieldset>

    <fieldset class="text-sm">
      <legend class="mb-1 text-neutral-700">Curated sections</legend>
      <div class="grid gap-2 sm:grid-cols-2">
        <label class="inline-flex items-center gap-2">
          <input v-model="isFounderFavourite" type="checkbox" data-testid="flag-founder" />
          Founder's Favourite
        </label>
        <label class="inline-flex items-center gap-2">
          <input v-model="isNewArrival" type="checkbox" data-testid="flag-new-arrival" />
          New Arrival
        </label>
        <label class="inline-flex items-center gap-2">
          <input v-model="isStatementPick" type="checkbox" data-testid="flag-statement" />
          Statement Pick
        </label>
        <label class="inline-flex items-center gap-2">
          <input v-model="isBridal" type="checkbox" data-testid="flag-bridal" />
          Bridal
        </label>
      </div>
    </fieldset>

    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Style group</span>
      <select v-model="styleGroup" data-testid="product-style-group" class="w-full rounded-md border border-neutral-300 px-3 py-2">
        <option value="">None</option>
        <option value="traditional">Traditional</option>
        <option value="modern">Modern</option>
      </select>
    </label>

    <div>
      <span class="mb-1 block text-sm text-neutral-700">Photos & videos</span>
      <ProductMediaUploader v-model="media" :product-id="mediaFolderId" />
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
