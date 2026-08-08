// Global Vitest setup for component/unit tests.
// Kept intentionally minimal; add global mocks/matchers here as real tests need them.

// jsdom doesn't implement matchMedia, but embla-carousel (used by our carousel
// sections) calls it internally to watch responsive breakpoint options.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom doesn't implement IntersectionObserver either, and embla-carousel
// (SlidesInView) instantiates one unconditionally. Fires "already visible"
// immediately on observe() so our own useScrollReveal-based sections don't
// stay hidden behind opacity-0 in tests.
//
// Intentionally does not `implements IntersectionObserver` — the DOM typings
// keep growing (e.g. scrollMargin) and a test stub shouldn't chase every field.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class ImmediateIntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds: ReadonlyArray<number> = []
    private readonly callback: IntersectionObserverCallback

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
    }

    observe(target: Element): void {
      const entry = {
        isIntersecting: true,
        target,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: 1,
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      } as IntersectionObserverEntry
      this.callback([entry], this as unknown as IntersectionObserver)
    }

    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  window.IntersectionObserver =
    ImmediateIntersectionObserver as unknown as typeof IntersectionObserver
  globalThis.IntersectionObserver =
    ImmediateIntersectionObserver as unknown as typeof IntersectionObserver
}

// jsdom doesn't implement ResizeObserver either, and embla-carousel
// (ResizeHandler) instantiates one unconditionally.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class NoopResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  window.ResizeObserver = NoopResizeObserver as unknown as typeof ResizeObserver
  globalThis.ResizeObserver = NoopResizeObserver as unknown as typeof ResizeObserver
}

export {}
