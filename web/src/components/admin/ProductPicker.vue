<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCatalogueStore } from '../../stores/catalogue'

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [ids: string[]] }>()

const catalogue = useCatalogueStore()
const query = ref('')

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return catalogue.products.filter((product) => {
    if (!term) return true
    return `${product.name} ${product.description}`.toLowerCase().includes(term)
  })
})

function isSelected(id: string) {
  return props.modelValue.includes(id)
}

function toggle(id: string) {
  if (isSelected(id)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((item) => item !== id),
    )
    return
  }
  emit('update:modelValue', [...props.modelValue, id])
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
</script>

<template>
  <div>
    <input
      v-model="query"
      type="search"
      data-testid="product-picker-search"
      placeholder="Search products…"
      class="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
    />
    <ul class="mb-4 max-h-56 space-y-1 overflow-y-auto rounded-md border border-neutral-200 bg-white">
      <li v-for="product in filtered" :key="product.id">
        <label class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-amore-cream">
          <input
            type="checkbox"
            :checked="isSelected(product.id)"
            :data-testid="`pick-product-${product.id}`"
            @change="toggle(product.id)"
          />
          <img :src="product.photoUrls[0]" :alt="product.name" class="h-8 w-8 rounded object-cover" />
          <span class="flex-1">{{ product.name }}</span>
          <span class="text-xs text-neutral-500">₹{{ product.priceInr.toLocaleString('en-IN') }}</span>
        </label>
      </li>
      <li v-if="filtered.length === 0" class="px-3 py-4 text-center text-xs text-neutral-500">No matching products.</li>
    </ul>
    <div v-if="modelValue.length > 0">
      <p class="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Selected order</p>
      <ul class="space-y-1">
        <li
          v-for="(id, index) in modelValue"
          :key="id"
          class="flex items-center justify-between rounded border border-neutral-200 bg-white px-3 py-1.5 text-sm"
        >
          <span>{{ productName(id) }}</span>
          <span class="flex gap-1">
            <button type="button" class="rounded border px-2 py-0.5 text-xs" @click="moveSelected(index, -1)">Up</button>
            <button type="button" class="rounded border px-2 py-0.5 text-xs" @click="moveSelected(index, 1)">Down</button>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
