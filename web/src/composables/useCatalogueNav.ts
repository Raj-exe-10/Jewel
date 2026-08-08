import { useCatalogueStore } from '../stores/catalogue'

/**
 * Central place for "pick a taxonomy entry, filter the catalogue, scroll to
 * it" behaviour, shared by the header nav, footer tag-cloud, and the curated
 * homepage tile sections so they all behave identically.
 */
export function useCatalogueNav() {
  const catalogue = useCatalogueStore()

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToCatalogue() {
    scrollToSection('catalogue')
  }

  function filterByCategory(categoryId: string) {
    catalogue.clearFilters()
    catalogue.setFilters({ categoryId })
    scrollToCatalogue()
  }

  function filterByCollection(collectionId: string) {
    catalogue.clearFilters()
    catalogue.setFilters({ collectionId })
    scrollToCatalogue()
  }

  function filterByStyleTag(styleTagId: string) {
    catalogue.clearFilters()
    catalogue.setFilters({ styleTagId })
    scrollToCatalogue()
  }

  function filterByBridal() {
    catalogue.clearFilters()
    catalogue.setFilters({ isBridal: true })
    scrollToCatalogue()
  }

  function clearAndScrollToCatalogue() {
    catalogue.clearFilters()
    scrollToCatalogue()
  }

  return {
    scrollToSection,
    scrollToCatalogue,
    filterByCategory,
    filterByCollection,
    filterByStyleTag,
    filterByBridal,
    clearAndScrollToCatalogue,
  }
}
