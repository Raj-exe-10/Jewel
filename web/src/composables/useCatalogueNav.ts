import { nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogueStore } from '../stores/catalogue'
import type { CtaTarget } from '../types/homepage'

const PRODUCTS_ANCHOR_ID = 'collection-products'
/** Sticky promo + header clearance — matches `scroll-mt-28` (~7rem). */
const STICKY_HEADER_OFFSET = 112
/** Extra gap below sticky header for homepage product carousels — matches `scroll-mt-36` vs `scroll-mt-28`. */
const PRODUCT_CAROUSEL_GAP = 24
const PRODUCT_CAROUSEL_ANCHORS = new Set(['shop-the-visuals-products', 'founders-favourites-products'])

function scrollOffsetFor(id: string): number {
  return STICKY_HEADER_OFFSET + (PRODUCT_CAROUSEL_ANCHORS.has(id) ? PRODUCT_CAROUSEL_GAP : 0)
}

/**
 * Central place for "pick a taxonomy entry, filter the catalogue, open the
 * full collection page" behaviour, shared by the header nav, footer, and
 * curated homepage tile sections.
 */
export function useCatalogueNav() {
  const catalogue = useCatalogueStore()
  const router = useRouter()
  const route = useRoute()

  function scrollToId(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - scrollOffsetFor(id)
    window.scrollTo({ top, behavior: 'smooth' })
  }

  function scrollToSection(id: string) {
    scrollToId(id)
  }

  function scrollToCollectionProducts() {
    scrollToId(PRODUCTS_ANCHOR_ID)
  }

  async function goToCollection() {
    await router.push({ name: 'collection', hash: `#${PRODUCTS_ANCHOR_ID}` })
    await nextTick()
    // Fallback when already on /collection (same-route hash may not re-trigger scrollBehavior)
    scrollToCollectionProducts()
  }

  /** Open Shop the Collection at the page top (heading), not the products anchor. */
  async function openCollectionPage() {
    catalogue.clearFilters()
    await router.push({ name: 'collection' })
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function goToHomeSection(anchorId: string) {
    if (route.path === '/') {
      await router.push({ path: '/', hash: `#${anchorId}` })
      await nextTick()
      scrollToId(anchorId)
      return
    }
    await router.push({ path: '/', hash: `#${anchorId}` })
  }

  function scrollToCatalogue() {
    void goToCollection()
  }

  function filterByCategory(categoryId: string) {
    catalogue.replaceFilters({ categoryId })
    void goToCollection()
  }

  function filterByCollection(collectionId: string) {
    catalogue.replaceFilters({ collectionId })
    void goToCollection()
  }

  function filterByStyleTag(styleTagId: string) {
    catalogue.replaceFilters({ styleTagId })
    void goToCollection()
  }

  function filterByBridal() {
    catalogue.replaceFilters({ isBridal: true })
    void goToCollection()
  }

  function clearAndScrollToCatalogue() {
    catalogue.clearFilters()
    void goToCollection()
  }

  function runCta(target: CtaTarget) {
    if (target.kind === 'bridal') {
      filterByBridal()
      return
    }
    if (target.kind === 'catalogue') {
      clearAndScrollToCatalogue()
      return
    }
    void goToHomeSection(target.anchorId)
  }

  return {
    scrollToSection,
    scrollToCollectionProducts,
    scrollToCatalogue,
    goToCollection,
    openCollectionPage,
    goToHomeSection,
    filterByCategory,
    filterByCollection,
    filterByStyleTag,
    filterByBridal,
    clearAndScrollToCatalogue,
    runCta,
  }
}
