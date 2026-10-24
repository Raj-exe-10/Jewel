<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import BlogTeaser from '../components/public/BlogTeaser.vue'
import FloatingWhatsAppButton from '../components/public/FloatingWhatsAppButton.vue'
import Footer from '../components/public/Footer.vue'
import Header from '../components/public/Header.vue'
import HomepageRenderer from '../components/public/HomepageRenderer.vue'
import InstagramGallery from '../components/public/InstagramGallery.vue'
import { createSectionDraft } from '../data/defaultSections'
import { useBusinessStore } from '../stores/business'
import { useCatalogueStore } from '../stores/catalogue'
import { useHomepageStore } from '../stores/homepage'
import { useWishlistStore } from '../stores/wishlist'
import type { HomepageSection } from '../types/homepage'

const catalogue = useCatalogueStore()
const homepage = useHomepageStore()
const wishlist = useWishlistStore()
const business = useBusinessStore()

const displaySections = computed(() => homepage.displaySections)

/** Blog sits between product bands and heritage — matches the reference order. */
const heritageIndex = computed(() =>
  displaySections.value.findIndex((section) => section.type === 'about'),
)
const sectionsBeforeBlog = computed(() => {
  const index = heritageIndex.value
  return index === -1 ? displaySections.value : displaySections.value.slice(0, index)
})
const sectionsFromHeritage = computed(() => {
  const index = heritageIndex.value
  return index === -1 ? [] : displaySections.value.slice(index)
})

/** Show Instagram feed even when CMS has not added an instagram_gallery section yet. */
const hasInstagramSection = computed(() =>
  displaySections.value.some((section) => section.type === 'instagram_gallery' && section.isVisible),
)
const fallbackInstagramSection = computed(
  () =>
    ({
      ...createSectionDraft('instagram_gallery', 99),
      id: 'fallback-instagram',
      createdAt: 0,
      updatedAt: 0,
      updatedBy: 'seed',
    }) as HomepageSection,
)

onMounted(() => {
  catalogue.subscribeToCatalogue()
  homepage.subscribeToSections()
  business.subscribeToProfile()
  wishlist.load()
})

useHead({
  title: 'Amore — Designer Jewelry, Made to Be Loved',
  meta: [
    {
      name: 'description',
      content:
        'Amore is a designer jewelry studio crafting handmade bridal and everyday pieces. Browse the catalogue and enquire instantly on WhatsApp.',
    },
    {
      name: 'keywords',
      content: 'designer jewelry, bridal jewelry, kundan, polki, handmade jewelry, Amore',
    },
    { property: 'og:title', content: 'Amore — Designer Jewelry, Made to Be Loved' },
    {
      property: 'og:description',
      content: 'Browse handcrafted jewelry and enquire instantly on WhatsApp.',
    },
    { property: 'og:type', content: 'website' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-amore-cream">
    <Header :business-phone-e164="business.whatsappNumberE164" />
    <main>
      <HomepageRenderer
        :sections="sectionsBeforeBlog"
        :business-phone-e164="business.whatsappNumberE164"
        :instagram-handle="business.instagramHandle"
      />
      <BlogTeaser />
      <HomepageRenderer
        v-if="sectionsFromHeritage.length > 0"
        :sections="sectionsFromHeritage"
        :business-phone-e164="business.whatsappNumberE164"
        :instagram-handle="business.instagramHandle"
      />
      <InstagramGallery
        v-if="!hasInstagramSection"
        :instagram-handle="business.instagramHandle"
        :section="fallbackInstagramSection"
      />
    </main>
    <Footer :instagram-handle="business.instagramHandle" :business-phone-e164="business.whatsappNumberE164" />
    <FloatingWhatsAppButton :business-phone-e164="business.whatsappNumberE164" />
  </div>
</template>
