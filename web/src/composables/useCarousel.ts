import { nextTick, onUnmounted, shallowRef, watch, ref, type Ref } from 'vue'
import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType, type EmblaPluginType } from 'embla-carousel'

/**
 * Direct Embla wrapper (bypassing embla-carousel-vue's mount timing) so
 * arrow buttons work even when slides arrive asynchronously after mount.
 */
export function useCarousel(
  options: EmblaOptionsType = {},
  plugins: EmblaPluginType[] = [],
  slideCount?: Ref<number>,
) {
  const emblaRef = ref<HTMLElement | null>(null)
  const emblaApi = shallowRef<EmblaCarouselType | undefined>(undefined)
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

  function destroy() {
    emblaApi.value?.destroy()
    emblaApi.value = undefined
  }

  async function init() {
    await nextTick()
    const node = emblaRef.value
    if (!node) return

    if (emblaApi.value) {
      emblaApi.value.reInit(options, plugins)
      syncState()
      return
    }

    const api = EmblaCarousel(node, options, plugins)
    emblaApi.value = api
    api.on('select', syncState)
    api.on('reInit', syncState)
    api.on('settle', syncState)
    syncState()
  }

  watch(emblaRef, (node) => {
    if (node) void init()
    else destroy()
  })

  if (slideCount) {
    watch(slideCount, () => {
      void init()
    })
  }

  onUnmounted(destroy)

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
