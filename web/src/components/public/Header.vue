<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bars3Icon, HeartIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { buildGeneralEnquiryLink } from '../../composables/useWhatsAppLink'
import { useCatalogueStore } from '../../stores/catalogue'
import { useWishlistStore } from '../../stores/wishlist'
import NavDropdown from './NavDropdown.vue'
import PromoBar from './PromoBar.vue'
import SearchOverlay from './SearchOverlay.vue'

const props = defineProps<{ businessPhoneE164: string }>()

const catalogue = useCatalogueStore()
const wishlist = useWishlistStore()
const nav = useCatalogueNav()

const isSearchOpen = ref(false)
const isMobileMenuOpen = ref(false)

const whatsAppLink = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
const categoryItems = computed(() => catalogue.categories.map((c) => ({ id: c.id, name: c.name })))
const collectionItems = computed(() => catalogue.collections.map((c) => ({ id: c.id, name: c.name })))
const styleItems = computed(() => catalogue.styleTags.map((s) => ({ id: s.id, name: s.name })))

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToNewArrivals() {
  nav.scrollToSection('shop-the-visuals')
  isMobileMenuOpen.value = false
}

function goToSignaturePicks() {
  nav.scrollToSection('founders-favourites')
  isMobileMenuOpen.value = false
}

function goToBridal() {
  nav.filterByBridal()
  isMobileMenuOpen.value = false
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
    <PromoBar />

    <div class="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
      <button
        type="button"
        data-testid="mobile-menu-toggle"
        aria-label="Toggle menu"
        class="rounded-md p-1 text-neutral-700 sm:hidden"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <component :is="isMobileMenuOpen ? XMarkIcon : Bars3Icon" class="h-6 w-6" />
      </button>

      <nav class="hidden items-center gap-6 sm:flex">
        <button
          type="button"
          data-testid="nav-new-arrivals"
          class="text-sm font-medium tracking-wide text-neutral-700 transition hover:text-amore-charcoal"
          @click="goToNewArrivals"
        >
          New Arrivals
        </button>
        <NavDropdown label="Categories" testid="nav-categories" :items="categoryItems" @select="nav.filterByCategory" />
        <NavDropdown label="Collections" testid="nav-collections" :items="collectionItems" @select="nav.filterByCollection" />
        <button
          type="button"
          data-testid="nav-bridal"
          class="text-sm font-medium tracking-wide text-neutral-700 transition hover:text-amore-charcoal"
          @click="goToBridal"
        >
          Bridal/Wedding
        </button>
        <NavDropdown label="Styles" testid="nav-styles" :items="styleItems" @select="nav.filterByStyleTag" />
        <button
          type="button"
          data-testid="nav-signature-picks"
          class="text-sm font-medium tracking-wide text-neutral-700 transition hover:text-amore-charcoal"
          @click="goToSignaturePicks"
        >
          Signature Picks
        </button>
      </nav>

      <a
        href="#"
        data-testid="brand-logo"
        class="font-display text-2xl tracking-wide text-neutral-900"
        @click.prevent="scrollToTop"
      >
        <h1 class="inline">Amore</h1>
      </a>

      <div class="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          data-testid="search-toggle"
          aria-label="Search"
          class="rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
          @click="isSearchOpen = !isSearchOpen"
        >
          <MagnifyingGlassIcon class="h-5 w-5" />
        </button>
        <a
          href="#catalogue"
          data-testid="wishlist-link"
          aria-label="Wishlist"
          class="relative rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
        >
          <HeartIcon class="h-5 w-5" />
          <span
            v-if="wishlist.productIds.length > 0"
            data-testid="wishlist-count"
            class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amore-gold text-[10px] font-semibold text-white"
          >
            {{ wishlist.productIds.length }}
          </span>
        </a>
        <a
          :href="whatsAppLink"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="header-whatsapp-cta"
          class="hidden items-center gap-1.5 rounded-full bg-amore-charcoal px-4 py-2 text-xs font-medium tracking-wide text-white transition hover:bg-black sm:inline-flex"
        >
          Enquire on WhatsApp
        </a>
      </div>

      <SearchOverlay :open="isSearchOpen" @close="isSearchOpen = false" />
    </div>

    <div v-if="isMobileMenuOpen" data-testid="mobile-menu-panel" class="border-t border-neutral-200 bg-white px-4 py-4 sm:hidden">
      <nav class="flex flex-col gap-3 text-sm text-neutral-700">
        <button type="button" data-testid="mobile-nav-new-arrivals" class="text-left" @click="goToNewArrivals">
          New Arrivals
        </button>
        <button type="button" data-testid="mobile-nav-bridal" class="text-left" @click="goToBridal">
          Bridal/Wedding
        </button>
        <button type="button" data-testid="mobile-nav-signature-picks" class="text-left" @click="goToSignaturePicks">
          Signature Picks
        </button>
        <a href="#about" class="text-left" @click="closeMobileMenu">About</a>
        <a href="#contact" class="text-left" @click="closeMobileMenu">Contact</a>
      </nav>
    </div>
  </header>
</template>
