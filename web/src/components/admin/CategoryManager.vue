<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  items: Array<{ id: string; name: string }>
  label: string
  isReferenced: (id: string) => boolean
}>()
const emit = defineEmits<{ add: [name: string]; remove: [id: string] }>()

const newName = ref('')
const blockedId = ref<string | null>(null)

function addItem() {
  const name = newName.value.trim()
  if (!name) return
  emit('add', name)
  newName.value = ''
}

function removeItem(id: string) {
  if (props.isReferenced(id)) {
    blockedId.value = id
    return
  }
  blockedId.value = null
  emit('remove', id)
}
</script>

<template>
  <div>
    <h3 class="mb-2 font-medium">{{ label }}</h3>
    <ul class="mb-3 space-y-1">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between rounded border border-neutral-200 px-3 py-1.5 text-sm"
      >
        <span>{{ item.name }}</span>
        <button
          type="button"
          :data-testid="`remove-item-${item.id}`"
          class="text-red-600"
          @click="removeItem(item.id)"
        >
          Remove
        </button>
      </li>
    </ul>

    <p v-if="blockedId" data-testid="reference-warning" class="mb-3 text-sm text-amber-700">
      This {{ label.toLowerCase() }} is still used by one or more products and can't be removed yet.
    </p>

    <div class="flex gap-2">
      <input
        v-model="newName"
        type="text"
        data-testid="new-item-name"
        :placeholder="`New ${label.toLowerCase()} name`"
        class="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
      />
      <button
        type="button"
        data-testid="add-item"
        class="rounded-md bg-neutral-900 px-4 py-1.5 text-sm text-white"
        @click="addItem"
      >
        Add
      </button>
    </div>
  </div>
</template>
