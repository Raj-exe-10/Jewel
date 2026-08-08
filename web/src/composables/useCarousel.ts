import { watch, ref } from 'vue'
import emblaCarouselVue from 'embla-carousel-vue'
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'

/**
 * Thin wrapper around embla-carousel-vue exposing the bits our sections need:
 * a template ref for the viewport, prev/next controls, and dot-nav state.
 */
export function useCarousel(options: EmblaOptionsType = {}, plugins: EmblaPluginType[] = []) {
  const [emblaRef, emblaApi] = emblaCarouselVue(options, plugins)
  const canScrollPrev = ref(false)
  const canScrollNext = ref(false)
  const selectedIndex = ref(0)
  const scrollSnaps = ref<number[]>([])

  function syncState() {
    const api = emblaApi.value
    if (!api) return
    canScrollPrev.value = api.canScrollPrev()
    canScrollNext.value = api.canScrollNext()
    selectedIndex.value = api.selectedScrollSnap()
    scrollSnaps.value = api.scrollSnapList()
  }

  watch(emblaApi, (api) => {
    if (!api) return
    syncState()
    api.on('select', syncState)
    api.on('reInit', syncState)
  })

  function scrollPrev() {
    emblaApi.value?.scrollPrev()
  }

  function scrollNext() {
    emblaApi.value?.scrollNext()
  }

  function scrollTo(index: number) {
    emblaApi.value?.scrollTo(index)
  }

  return {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    scrollSnaps,
    scrollPrev,
    scrollNext,
    scrollTo,
  }
}
