<script setup lang="ts">
import { onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import FloatingWhatsAppButton from '../components/public/FloatingWhatsAppButton.vue'
import Footer from '../components/public/Footer.vue'
import Header from '../components/public/Header.vue'
import HomepageRenderer from '../components/public/HomepageRenderer.vue'
import { useBusinessStore } from '../stores/business'
import { useCatalogueStore } from '../stores/catalogue'
import { useHomepageStore } from '../stores/homepage'
import { useWishlistStore } from '../stores/wishlist'

const catalogue = useCatalogueStore()
const homepage = useHomepageStore()
const wishlist = useWishlistStore()
const business = useBusinessStore()

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
  <div class="min-h-screen bg-amore-theme">
    <Header :business-phone-e164="business.whatsappNumberE164" />
    <main>
      <HomepageRenderer
        :sections="homepage.displaySections"
        :business-phone-e164="business.whatsappNumberE164"
        :instagram-handle="business.instagramHandle"
      />
    </main>
    <Footer :instagram-handle="business.instagramHandle" :business-phone-e164="business.whatsappNumberE164" />
    <FloatingWhatsAppButton :business-phone-e164="business.whatsappNumberE164" />
  </div>
</template>
