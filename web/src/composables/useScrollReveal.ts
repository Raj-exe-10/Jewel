import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Fades/slides a section in once it enters the viewport. Falls back to
 * immediately-visible when IntersectionObserver isn't available (older
 * browsers, some test environments) so content is never hidden.
 */
export function useScrollReveal(options: IntersectionObserverInit = { threshold: 0.15 }) {
  const target = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined' || !target.value) {
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
        }
      }
    }, options)
    observer.observe(target.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { target, isVisible }
}
