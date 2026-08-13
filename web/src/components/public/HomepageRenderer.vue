<script setup lang="ts">
import type { Component } from 'vue'
import type { HomepageSection, ProductCarouselContent } from '../../types/homepage'
import AboutSection from './AboutSection.vue'
import BridalSpotlight from './BridalSpotlight.vue'
import CatalogueGrid from './CatalogueGrid.vue'
import ContactSection from './ContactSection.vue'
import FoundersFavourites from './FoundersFavourites.vue'
import HeroBanner from './HeroBanner.vue'
import HeroVisuals from './HeroVisuals.vue'
import InstagramGallery from './InstagramGallery.vue'
import ShopByCategories from './ShopByCategories.vue'
import ShopByCraft from './ShopByCraft.vue'
import ShopTheStyle from './ShopTheStyle.vue'
import StudioLocation from './StudioLocation.vue'

defineProps<{
  sections: HomepageSection[]
  businessPhoneE164: string
  instagramHandle: string
  /** Admin live-preview only: show a label when a section component renders nothing. */
  showEmptyPlaceholders?: boolean
}>()

const typeMap: Record<string, Component> = {
  hero_banner: HeroBanner,
  video_carousel: HeroVisuals,
  style_tiles: ShopTheStyle,
  category_grid: ShopByCategories,
  collection_tiles: ShopByCraft,
  catalogue_grid: CatalogueGrid,
  about: AboutSection,
  instagram_gallery: InstagramGallery,
  studio_location: StudioLocation,
  contact: ContactSection,
}

function componentFor(section: HomepageSection): Component {
  if (section.type === 'product_carousel') {
    const variant = (section.content as ProductCarouselContent).variant
    return variant === 'bridal' ? BridalSpotlight : FoundersFavourites
  }
  return typeMap[section.type] ?? AboutSection
}
</script>

<template>
  <div v-for="section in sections" :key="section.id" class="relative">
    <p
      v-if="showEmptyPlaceholders"
      class="pointer-events-none sticky top-0 z-10 border-b border-dashed border-amore-gold/40 bg-amore-cream/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500"
      data-testid="section-preview-label"
    >
      {{ section.title }}
    </p>
    <component
      :is="componentFor(section)"
      :section="section"
      :business-phone-e164="businessPhoneE164"
      :instagram-handle="instagramHandle"
    />
  </div>
</template>
