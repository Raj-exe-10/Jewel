<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'
import { useCarousel } from '../../composables/useCarousel'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { useCatalogueStore } from '../../stores/catalogue'
import ProductCard from './ProductCard.vue'

defineProps<{ businessPhoneE164: string }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const bridalProducts = computed(() => catalogue.products.filter((p) => p.isBridal))

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

const { emblaRef, scrollPrev, scrollNext } = useCarousel({ align: 'start', dragFree: true })
// Bound via the plain `ref="emblaRef"` template attribute below; vue-tsc's
// unused-locals check can't see that indirect usage.
void emblaRef
</script>

<template>
  <section v-if="bridalProducts.length > 0" class="bg-amore-cream py-14">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-8 grid overflow-hidden rounded-2xl bg-amore-charcoal text-amore-cream sm:grid-cols-2">
        <img
          src="https://picsum.photos/seed/amore-bridal-banner/800/900"
          alt="Bridal ensembles by Amore"
          class="h-64 w-full object-cover sm:h-full"
        />
        <div class="flex flex-col justify-center gap-3 p-8">
          <p class="text-xs uppercase tracking-[0.3em] text-amore-gold">Bridal</p>
          <h2 class="font-display text-3xl">Curated Bridal Ensembles</h2>
          <p class="text-sm text-amore-cream/80">
            Statement sets designed for the big day — from kundan chokers to layered harams.
          </p>
          <button
            type="button"
            data-testid="bridal-cta"
            class="mt-2 w-fit rounded-full bg-white px-6 py-2.5 text-sm font-medium text-amore-charcoal transition hover:bg-amore-cream"
            @click="nav.filterByBridal"
          >
            Explore Bridal Collection
          </button>
        </div>
      </div>

      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-display text-xl text-neutral-900">Bridal Ensembles</h3>
        <div class="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous"
            data-testid="bridal-prev"
            class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-white"
            @click="scrollPrev"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            data-testid="bridal-next"
            class="rounded-full border border-neutral-300 p-1.5 transition hover:bg-white"
            @click="scrollNext"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref="emblaRef" class="overflow-hidden">
        <div class="flex gap-4">
          <div
            v-for="product in bridalProducts"
            :key="product.id"
            class="min-w-0 flex-[0_0_70%] sm:flex-[0_0_32%] lg:flex-[0_0_23%]"
          >
            <ProductCard
              :product="product"
              :category-name="categoryNameFor(product.categoryId)"
              :business-phone-e164="businessPhoneE164"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
