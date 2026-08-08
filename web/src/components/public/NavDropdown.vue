<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

defineProps<{
  label: string
  items: Array<{ id: string; name: string }>
  testid: string
}>()

const emit = defineEmits<{ select: [id: string] }>()

const isOpen = ref(false)

function choose(id: string) {
  isOpen.value = false
  emit('select', id)
}
</script>

<template>
  <div class="relative" @mouseleave="isOpen = false">
    <button
      type="button"
      :data-testid="`${testid}-toggle`"
      class="flex items-center gap-1 text-sm font-medium tracking-wide text-neutral-700 transition hover:text-amore-charcoal"
      @click="isOpen = !isOpen"
      @mouseenter="isOpen = true"
    >
      {{ label }}
      <ChevronDownIcon class="h-3.5 w-3.5 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :data-testid="`${testid}-panel`"
        class="absolute left-1/2 top-full z-30 mt-3 w-56 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl"
      >
        <ul class="space-y-1">
          <li v-for="item in items" :key="item.id">
            <button
              type="button"
              :data-testid="`${testid}-item-${item.id}`"
              class="block w-full rounded-md px-3 py-1.5 text-left text-sm text-neutral-700 transition hover:bg-amore-cream hover:text-amore-charcoal"
              @click="choose(item.id)"
            >
              {{ item.name }}
            </button>
          </li>
          <li v-if="items.length === 0" class="px-3 py-1.5 text-sm text-neutral-400">Coming soon</li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translate(-50%, -4px);
}
</style>
