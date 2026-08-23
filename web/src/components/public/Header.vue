<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Bars3Icon, HeartIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { buildGeneralEnquiryLink } from '../../composables/useWhatsAppLink'
import { useCatalogueStore } from '../../stores/catalogue'
import { useWishlistStore } from '../../stores/wishlist'
import NavDropdown from './NavDropdown.vue'
import PromoBar from './PromoBar.vue'
import SearchOverlay from './SearchOverlay.vue'
import WishlistDrawer from './WishlistDrawer.vue'
import WhatsAppIcon from './WhatsAppIcon.vue'

const props = defineProps<{ businessPhoneE164: string }>()

const route = useRoute()
const catalogue = useCatalogueStore()
const wishlist = useWishlistStore()
const nav = useCatalogueNav()

const isSearchOpen = ref(false)
const isWishlistOpen = ref(false)
const isMobileMenuOpen = ref(false)

const whatsAppLink = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
const categoryItems = computed(() => catalogue.categories.map((c) => ({ id: c.id, name: c.name })))
const collectionItems = computed(() => catalogue.collections.map((c) => ({ id: c.id, name: c.name })))
const styleItems = computed(() => catalogue.styleTags.map((s) => ({ id: s.id, name: s.name })))
const brandLogoSrc = '/brand/amore-logo.jpg'

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onBrandClick() {
  if (route.path === '/') {
    scrollToTop()
  }
}

function waitForMenuLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

/** Close the mobile panel first so sticky-header height is stable before scrolling. */
async function afterMobileMenuClose(action: () => void | Promise<void>) {
  const wasOpen = isMobileMenuOpen.value
  isMobileMenuOpen.value = false
  if (wasOpen) {
    await nextTick()
    await waitForMenuLayout()
  }
  await action()
}

async function goToNewArrivals() {
  await afterMobileMenuClose(() => nav.goToHomeSection('shop-the-visuals-products'))
}

async function goToSignaturePicks() {
  await afterMobileMenuClose(() => nav.goToHomeSection('founders-favourites-products'))
}

async function goToBridal() {
  await afterMobileMenuClose(() => {
    nav.filterByBridal()
  })
}

async function goToCollection() {
  await afterMobileMenuClose(() => nav.openCollectionPage())
}

async function goToAbout() {
  await afterMobileMenuClose(() => nav.goToHomeSection('about'))
}

async function goToContact() {
  await afterMobileMenuClose(() => nav.goToHomeSection('contact'))
}

async function openSearch() {
  isSearchOpen.value = true
  isWishlistOpen.value = false
  await nextTick()
}

function openWishlist() {
  isWishlistOpen.value = true
  isSearchOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-amore-wordmark/30 bg-amore-header">
    <PromoBar />

    <div class="relative mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 md:justify-center md:gap-4">
      <button
        type="button"
        data-testid="mobile-menu-toggle"
        aria-label="Toggle menu"
        class="z-10 rounded-md p-1 text-amore-cream transition hover:bg-white/10 md:hidden"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <component :is="isMobileMenuOpen ? XMarkIcon : Bars3Icon" class="h-6 w-6" />
      </button>

      <router-link
        to="/"
        data-testid="brand-logo"
        class="absolute left-1/2 flex shrink-0 -translate-x-1/2 items-center gap-2 md:static md:translate-x-0 sm:gap-2.5"
        @click="onBrandClick"
      >
        <img
          :src="brandLogoSrc"
          alt=""
          class="h-10 w-10 rounded-full object-cover ring-1 ring-amore-wordmark/40 sm:h-12 sm:w-12"
        />
        <h1 class="font-brand text-xl font-bold uppercase tracking-wide text-amore-wordmark sm:text-2xl">AMORE</h1>
      </router-link>

      <nav class="hidden items-center gap-3 whitespace-nowrap lg:gap-4 md:flex">
        <button
          type="button"
          data-testid="nav-new-arrivals"
          class="whitespace-nowrap text-sm font-medium tracking-wide text-amore-cream transition hover:text-amore-wordmark"
          @click="goToNewArrivals"
        >
          New Arrivals
        </button>
        <NavDropdown label="Categories" testid="nav-categories" :items="categoryItems" @select="nav.filterByCategory" />
        <NavDropdown label="Collections" testid="nav-collections" :items="collectionItems" @select="nav.filterByCollection" />
        <button
          type="button"
          data-testid="nav-bridal"
          class="whitespace-nowrap text-sm font-medium tracking-wide text-amore-cream transition hover:text-amore-wordmark"
          @click="goToBridal"
        >
          Bridal/Wedding
        </button>
        <NavDropdown label="Styles" testid="nav-styles" :items="styleItems" @select="nav.filterByStyleTag" />
        <button
          type="button"
          data-testid="nav-signature-picks"
          class="whitespace-nowrap text-sm font-medium tracking-wide text-amore-cream transition hover:text-amore-wordmark"
          @click="goToSignaturePicks"
        >
          Signature Picks
        </button>
      </nav>

      <div class="z-10 ml-auto flex items-center gap-2 md:ml-0 sm:gap-3">
        <button
          type="button"
          data-testid="search-toggle"
          aria-label="Search"
          class="rounded-full p-2 text-amore-cream transition hover:bg-white/10 hover:text-amore-wordmark"
          @click="openSearch"
        >
          <MagnifyingGlassIcon class="h-5 w-5" />
        </button>
        <button
          type="button"
          data-testid="wishlist-link"
          aria-label="Wishlist"
          class="relative rounded-full p-2 text-amore-cream transition hover:bg-white/10 hover:text-amore-wordmark"
          @click="openWishlist"
        >
          <HeartIcon class="h-5 w-5" />
          <span
            v-if="wishlist.productIds.length > 0"
            data-testid="wishlist-count"
            class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amore-wordmark text-[10px] font-semibold text-amore-header"
          >
            {{ wishlist.productIds.length }}
          </span>
        </button>
        <a
          :href="whatsAppLink"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="header-whatsapp-cta"
          class="hidden items-center gap-1.5 rounded-full bg-whatsapp px-4 py-2 text-xs font-medium tracking-wide whitespace-nowrap text-white transition hover:bg-whatsapp-dark md:inline-flex"
        >
          <WhatsAppIcon size-class="h-3.5 w-3.5" />
          Enquire on WhatsApp
        </a>
      </div>

      <SearchOverlay :open="isSearchOpen" @close="isSearchOpen = false" />
    </div>

    <div
      v-if="isMobileMenuOpen"
      data-testid="mobile-menu-panel"
      class="border-t border-amore-wordmark/30 bg-amore-header px-4 py-4 md:hidden"
    >
      <nav class="flex flex-col gap-3 text-sm text-amore-cream">
        <button type="button" data-testid="mobile-nav-new-arrivals" class="text-left hover:text-amore-wordmark" @click="goToNewArrivals">
          New Arrivals
        </button>
        <button
          type="button"
          data-testid="mobile-nav-signature-picks"
          class="text-left hover:text-amore-wordmark"
          @click="goToSignaturePicks"
        >
          Signature Picks
        </button>
        <button type="button" data-testid="mobile-nav-collection" class="text-left hover:text-amore-wordmark" @click="goToCollection">
          Collection
        </button>
        <button type="button" data-testid="mobile-nav-about" class="text-left hover:text-amore-wordmark" @click="goToAbout">
          About
        </button>
        <button type="button" data-testid="mobile-nav-contact" class="text-left hover:text-amore-wordmark" @click="goToContact">
          Contact
        </button>
      </nav>
    </div>

    <WishlistDrawer
      :open="isWishlistOpen"
      :business-phone-e164="businessPhoneE164"
      @close="isWishlistOpen = false"
    />
  </header>
</template>
