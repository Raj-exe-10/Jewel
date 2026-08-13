<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

defineProps<{
  label: string
  items: Array<{ id: string; name: string }>
  testid: string
}>()

const emit = defineEmits<{ select: [id: string] }>()

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null

function open() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  isOpen.value = true
}

function scheduleClose() {
  if (closeTimer) clearTimeout(closeTimer)
  // Tiny delay so the pointer can cross from the trigger into the panel
  // without the menu vanishing in the gap.
  closeTimer = setTimeout(() => {
    isOpen.value = false
    closeTimer = null
  }, 120)
}

function choose(id: string) {
  isOpen.value = false
  emit('select', id)
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (target && rootEl.value && !rootEl.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<template>
  <!--
    Panel sits flush under the trigger (pt-3 padding creates the visual gap
    while keeping the hover hit-area continuous — no dead zone).
  -->
  <div ref="rootEl" class="relative" @mouseenter="open" @mouseleave="scheduleClose">
    <button
      type="button"
      :data-testid="`${testid}-toggle`"
      class="flex items-center gap-1 text-sm font-medium tracking-wide text-neutral-700 transition hover:text-amore-charcoal"
      @click="isOpen = !isOpen"
    >
      {{ label }}
      <ChevronDownIcon class="h-3.5 w-3.5 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :data-testid="`${testid}-panel`"
        class="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3"
      >
        <div class="rounded-lg border border-neutral-200 bg-white p-3 shadow-xl">
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
