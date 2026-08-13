<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    noticeOnly?: boolean
  }>(),
  {
    confirmLabel: 'Confirm',
    noticeOnly: false,
  },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div
    v-if="open"
    data-testid="confirm-dialog"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
    role="alertdialog"
    aria-modal="true"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <h2 class="mb-2 font-medium text-neutral-900">{{ title }}</h2>
      <p class="mb-5 text-sm text-neutral-700">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button
          v-if="!noticeOnly"
          type="button"
          data-testid="confirm-dialog-cancel"
          class="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="confirm-dialog-confirm"
          class="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
