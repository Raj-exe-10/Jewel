<script setup lang="ts">
import { SECTION_TYPE_LABELS } from '../../types/homepage'
import type { HomepageSection } from '../../types/homepage'

defineProps<{ sections: HomepageSection[] }>()
const emit = defineEmits<{
  edit: [id: string]
  remove: [id: string]
  toggle: [id: string]
  move: [id: string, direction: -1 | 1]
}>()
</script>

<template>
  <ul data-testid="section-list" class="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
    <li
      v-for="section in sections"
      :key="section.id"
      class="flex flex-wrap items-center gap-3 px-4 py-3"
      :class="section.isVisible ? '' : 'bg-neutral-50 opacity-70'"
      :data-testid="`section-row-${section.id}`"
    >
      <div class="min-w-0 flex-1">
        <p class="font-medium text-neutral-900">{{ section.title }}</p>
        <p class="text-xs text-neutral-500">
          {{ SECTION_TYPE_LABELS[section.type] }}
          <span v-if="!section.isVisible" class="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] uppercase tracking-wide">Hidden</span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="rounded-md border px-2 py-1 text-xs" data-testid="move-section-up" @click="emit('move', section.id, -1)">
          Up
        </button>
        <button type="button" class="rounded-md border px-2 py-1 text-xs" data-testid="move-section-down" @click="emit('move', section.id, 1)">
          Down
        </button>
        <button
          type="button"
          class="rounded-md border px-2 py-1 text-xs"
          data-testid="toggle-section-visibility"
          @click="emit('toggle', section.id)"
        >
          {{ section.isVisible ? 'Hide' : 'Unhide' }}
        </button>
        <button type="button" class="rounded-md border px-2 py-1 text-xs" data-testid="edit-section" @click="emit('edit', section.id)">
          Edit
        </button>
        <button
          type="button"
          class="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600"
          data-testid="delete-section"
          @click="emit('remove', section.id)"
        >
          Delete
        </button>
      </div>
    </li>
    <li v-if="sections.length === 0" class="px-4 py-8 text-center text-sm text-neutral-500">
      No sections yet. Add one or restore the default storefront layout.
    </li>
  </ul>
</template>
