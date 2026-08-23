<script setup lang="ts">
defineProps<{
  open: boolean
  itemLabel: string
  warning?: string | null
}>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    role="alertdialog"
    aria-modal="true"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <p class="mb-3 text-sm text-neutral-700">
        Delete <strong>{{ itemLabel }}</strong
        >? This cannot be undone.
      </p>
      <p
        v-if="warning"
        data-testid="delete-dependency-warning"
        class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
      >
        {{ warning }}
      </p>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          data-testid="cancel-delete"
          class="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="confirm-delete"
          class="rounded-md bg-red-600 px-4 py-2 text-sm text-white"
          @click="emit('confirm')"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
