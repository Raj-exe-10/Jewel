<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { productsForSection } from '../../lib/sectionProducts'
import { useCatalogueStore } from '../../stores/catalogue'
import type { Product } from '../../types/catalogue'
import type { HomepageSection, ProductCarouselContent } from '../../types/homepage'
import LuxuryDarkBand from './LuxuryDarkBand.vue'
import ProductCard from './ProductCard.vue'
import ShowcaseProductCard from './ShowcaseProductCard.vue'

const props = defineProps<{ businessPhoneE164: string; section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('founders-favourites'))
const content = computed(() => resolved.value.content as ProductCarouselContent)
const isDarkGrid = computed(() => content.value.band === 'dark-grid')
const favourites = computed(() => productsForSection(resolved.value, catalogue.products))

/** Embla only loops when slides overflow the viewport; duplicate short lists. */
const slides = computed(() => {
  const items = favourites.value
  if (items.length === 0) return [] as { product: Product; key: string }[]
  const source = items.length < 6 ? [...items, ...items] : items
  return source.map((product, index) => ({ product, key: `${product.id}-${index}` }))
})
const slideCount = computed(() => slides.value.length)

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

const { emblaRef, scrollPrev, scrollNext } = useCarousel(
  { loop: true, align: 'start', slidesToScroll: 1 },
  [],
  slideCount,
)
void emblaRef

const productsAnchorId = computed(() =>
  isDarkGrid.value ? `${resolved.value.anchorId}-products` : 'founders-favourites-products',
)

const displayTitle = computed(() => {
  const title = resolved.value.title?.trim()
  if (!title || /founder/i.test(title)) return 'Diamonds & Engagement Ring'
  return title
})
</script>

<template>
  <!-- Dark grid band (Ruby / diamond-style collection strip) -->
  <LuxuryDarkBand
    v-if="favourites.length > 0 && isDarkGrid"
    :id="resolved.anchorId"
    class="scroll-mt-28 md:scroll-mt-32"
  >
    <div class="mb-8 flex items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-xs uppercase tracking-[0.35em] text-amore-gold">Collection</p>
        <h2 class="font-display text-3xl text-amore-cream sm:text-4xl">{{ resolved.title }}</h2>
        <p v-if="resolved.subtitle" class="mt-2 max-w-lg text-sm text-amore-cream/70">
          {{ resolved.subtitle }}
        </p>
      </div>
      <div class="hidden gap-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          data-testid="founders-favourites-prev"
          class="border border-amore-cream/30 p-1.5 text-amore-cream transition hover:border-amore-gold hover:text-amore-gold"
          @click.stop="scrollPrev"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          data-testid="founders-favourites-next"
          class="border border-amore-cream/30 p-1.5 text-amore-cream transition hover:border-amore-gold hover:text-amore-gold"
          @click.stop="scrollNext"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div :id="productsAnchorId" ref="emblaRef" class="scroll-mt-36 overflow-hidden md:scroll-mt-40">
      <div class="flex">
        <div
          v-for="slide in slides"
          :key="slide.key"
          class="mr-4 min-w-0 flex-[0_0_78%] sm:flex-[0_0_42%] lg:flex-[0_0_23%]"
        >
          <ProductCard
            :product="slide.product"
            :category-name="categoryNameFor(slide.product.categoryId)"
            :business-phone-e164="businessPhoneE164"
            responsive-compact
            detail-origin="home"
            cta-label="Add To Cart"
          />
        </div>
      </div>
    </div>
  </LuxuryDarkBand>

  <!-- Light split showcase — matches Diamonds & Engagement sample -->
  <section
    v-else-if="favourites.length > 0"
    :id="resolved.anchorId"
    class="scroll-mt-28 bg-[#f7f1ea] py-14 md:scroll-mt-32 sm:py-16"
  >
    <div class="mx-auto max-w-screen-2xl px-4">
      <div class="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)] lg:gap-12">
        <div class="max-w-md">
          <h2 class="font-display text-3xl leading-tight text-amore-maroon sm:text-4xl lg:text-[2.75rem]">
            {{ displayTitle }}
          </h2>
          <p class="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-[0.95rem]">
            {{
              resolved.subtitle ||
              'Discover timeless diamond and engagement pieces — curated signatures crafted for the moments that matter most.'
            }}
          </p>
          <button
            type="button"
            class="mt-7 rounded-md bg-amore-maroon px-6 py-2.5 text-sm font-medium tracking-wide text-amore-cream transition hover:bg-amore-burgundy"
            @click="nav.openCollectionPage"
          >
            More Products
          </button>
        </div>

        <div class="relative min-w-0 px-0 sm:px-10">
          <button
            type="button"
            aria-label="Previous"
            data-testid="founders-favourites-prev"
            class="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-amore-burgundy/15 bg-white text-amore-charcoal shadow-md transition hover:border-amore-gold hover:text-amore-burgundy sm:flex"
            @click.stop="scrollPrev"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            data-testid="founders-favourites-next"
            class="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-amore-burgundy/15 bg-white text-amore-charcoal shadow-md transition hover:border-amore-gold hover:text-amore-burgundy sm:flex"
            @click.stop="scrollNext"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </button>

          <div
            id="founders-favourites-products"
            ref="emblaRef"
            class="scroll-mt-36 overflow-hidden md:scroll-mt-40"
          >
            <div class="flex">
              <div
                v-for="slide in slides"
                :key="slide.key"
                class="mr-5 min-w-0 flex-[0_0_85%] sm:flex-[0_0_55%] lg:flex-[0_0_48%]"
              >
                <ShowcaseProductCard
                  :product="slide.product"
                  :category-name="categoryNameFor(slide.product.categoryId)"
                  :business-phone-e164="businessPhoneE164"
                  detail-origin="home"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
