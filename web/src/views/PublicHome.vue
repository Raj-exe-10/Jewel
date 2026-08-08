<script setup lang="ts">
import { onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import AboutSection from '../components/public/AboutSection.vue'
import BridalSpotlight from '../components/public/BridalSpotlight.vue'
import CatalogueGrid from '../components/public/CatalogueGrid.vue'
import ContactSection from '../components/public/ContactSection.vue'
import FloatingWhatsAppButton from '../components/public/FloatingWhatsAppButton.vue'
import Footer from '../components/public/Footer.vue'
import FoundersFavourites from '../components/public/FoundersFavourites.vue'
import Header from '../components/public/Header.vue'
import HeroBanner from '../components/public/HeroBanner.vue'
import HeroVisuals from '../components/public/HeroVisuals.vue'
import InstagramGallery from '../components/public/InstagramGallery.vue'
import ShopByCategories from '../components/public/ShopByCategories.vue'
import ShopByCraft from '../components/public/ShopByCraft.vue'
import ShopTheStyle from '../components/public/ShopTheStyle.vue'
import StudioLocation from '../components/public/StudioLocation.vue'
import { useCatalogueStore } from '../stores/catalogue'
import { useWishlistStore } from '../stores/wishlist'

const businessPhoneE164 = import.meta.env.VITE_WHATSAPP_NUMBER as string
const instagramHandle = import.meta.env.VITE_INSTAGRAM_HANDLE as string

const catalogue = useCatalogueStore()
const wishlist = useWishlistStore()

onMounted(() => {
  catalogue.subscribeToCatalogue()
  wishlist.load()
})

// FR-028: SEO meta tags for the single-page storefront.
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
  <div>
    <Header :business-phone-e164="businessPhoneE164" />
    <main>
      <HeroBanner />
      <HeroVisuals />
      <FoundersFavourites :business-phone-e164="businessPhoneE164" />
      <ShopTheStyle />
      <ShopByCategories />
      <ShopByCraft />
      <BridalSpotlight :business-phone-e164="businessPhoneE164" />
      <CatalogueGrid :business-phone-e164="businessPhoneE164" />
      <AboutSection />
      <InstagramGallery :instagram-handle="instagramHandle" />
      <StudioLocation :business-phone-e164="businessPhoneE164" />
      <ContactSection :business-phone-e164="businessPhoneE164" :instagram-handle="instagramHandle" />
    </main>
    <Footer :instagram-handle="instagramHandle" :business-phone-e164="businessPhoneE164" />
    <FloatingWhatsAppButton :business-phone-e164="businessPhoneE164" />
  </div>
</template>
