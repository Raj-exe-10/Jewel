<script setup lang="ts">
import { computed, ref } from 'vue'
import { coverUrlFromMedia, mediaFromProduct } from '../../lib/productMedia'
import { useCatalogueStore } from '../../stores/catalogue'

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [ids: string[]] }>()

const catalogue = useCatalogueStore()
const query = ref('')
const open = ref(false)

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return catalogue.products.filter((product) => {
    if (props.modelValue.includes(product.id)) return false
    if (!term) return true
    return `${product.name} ${product.description}`.toLowerCase().includes(term)
  })
})

function addProduct(id: string) {
  if (props.modelValue.includes(id)) return
  emit('update:modelValue', [...props.modelValue, id])
  query.value = ''
  open.value = false
}

function removeSelected(id: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((item) => item !== id),
  )
}

function moveSelected(index: number, direction: -1 | 1) {
  const next = index + direction
  if (next < 0 || next >= props.modelValue.length) return
  const copy = [...props.modelValue]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item!)
  emit('update:modelValue', copy)
}

function productName(id: string) {
  return catalogue.products.find((product) => product.id === id)?.name ?? id
}

function productThumb(id: string) {
  const product = catalogue.products.find((item) => item.id === id)
  if (!product) return ''
  return coverUrlFromMedia(mediaFromProduct(product), product.photoUrls[0] ?? '')
}
</script>

<template>
  <div>
    <p v-if="catalogue.products.length === 0" data-testid="product-picker-empty" class="mb-3 text-sm text-amber-700">
      Add products under Products first, then pick them here.
    </p>

    <div v-else class="relative mb-3">
      <input
        v-model="query"
        type="search"
        data-testid="product-picker-search"
        placeholder="Search products to add…"
        class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        @focus="open = true"
        @input="open = true"
      />
      <ul
        v-if="open"
        data-testid="product-picker-dropdown"
        class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-neutral-200 bg-white shadow-lg"
      >
        <li v-for="product in filtered" :key="product.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-amore-cream"
            :data-testid="`pick-product-${product.id}`"
            @click="addProduct(product.id)"
          >
            <img
              :src="coverUrlFromMedia(mediaFromProduct(product), product.photoUrls[0] ?? '')"
              :alt="product.name"
              class="h-8 w-8 rounded object-cover"
            />
            <span class="flex-1">{{ product.name }}</span>
            <span class="text-xs text-neutral-500">₹{{ product.priceInr.toLocaleString('en-IN') }}</span>
          </button>
        </li>
        <li v-if="filtered.length === 0" class="px-3 py-4 text-center text-xs text-neutral-500">
          No matching products.
        </li>
      </ul>
    </div>

    <div v-if="modelValue.length > 0">
      <p class="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Selected order</p>
      <ul class="space-y-1">
        <li
          v-for="(id, index) in modelValue"
          :key="id"
          class="flex items-center justify-between gap-2 rounded border border-neutral-200 bg-white px-3 py-1.5 text-sm"
        >
          <div class="flex min-w-0 items-center gap-2">
            <img v-if="productThumb(id)" :src="productThumb(id)" :alt="productName(id)" class="h-8 w-8 rounded object-cover" />
            <span class="truncate">{{ productName(id) }}</span>
          </div>
          <div class="flex shrink-0 gap-1">
            <button type="button" class="rounded border px-2 py-0.5 text-xs" @click="moveSelected(index, -1)">Up</button>
            <button type="button" class="rounded border px-2 py-0.5 text-xs" @click="moveSelected(index, 1)">Down</button>
            <button type="button" class="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600" @click="removeSelected(id)">
              Remove
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
