<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { defaultSectionByAnchor } from '../../data/defaultSections'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import type { HomepageSection, TaxonomyTilesContent } from '../../types/homepage'

const props = defineProps<{ section?: HomepageSection }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()
const resolved = computed(() => props.section ?? defaultSectionByAnchor('shop-by-categories'))
const content = computed(() => resolved.value.content as TaxonomyTilesContent)
const overrides = computed(() => content.value.tileImageOverrides ?? {})
const preferredLabels = computed(
  () => content.value.preferredLabels ?? ['Bracelet', 'Earrings', 'Couple Rings'],
)

function scoreCategory(name: string, preferred: string): number {
  const n = name.toLowerCase()
  const p = preferred.toLowerCase()
  if (n === p) return 100
  if (n.includes(p) || p.includes(n)) return 80
  if (p.includes('bracelet') && /bracelet|bangle/i.test(n)) return 70
  if (p.includes('earring') && /earring|eartop|jhumka/i.test(n)) return 70
  if (p.includes('ring') && /ring/i.test(n) && !/earring/i.test(n)) return 70
  return 0
}

const tiles = computed(() => {
  const categories = catalogue.categories
  if (categories.length === 0) return []

  const used = new Set<string>()
  const picked: Array<{ id: string; name: string; image: string }> = []

  for (const label of preferredLabels.value) {
    let best: { id: string; name: string; score: number } | null = null
    for (const category of categories) {
      if (used.has(category.id)) continue
      const score = scoreCategory(category.name, label)
      if (score > 0 && (!best || score > best.score)) {
        best = { id: category.id, name: category.name, score }
      }
    }
    if (best) {
      used.add(best.id)
      picked.push({
        id: best.id,
        name: label,
        image: overrides.value[best.id] ?? jewelryImageFor(label, picked.length),
      })
    }
  }

  for (const category of categories) {
    if (picked.length >= 3) break
    if (used.has(category.id)) continue
    used.add(category.id)
    picked.push({
      id: category.id,
      name: category.name,
      image: overrides.value[category.id] ?? jewelryImageFor(category.name, picked.length),
    })
  }

  return picked
})
</script>

<template>
  <!--
    Transparent section + negative margin so cards straddle the hero (maroon) / cream boundary.
    Do NOT put bg-amore-cream on this section — that paints over the hero and kills the overlap.
  -->
  <section
    v-if="tiles.length > 0"
    :id="resolved.anchorId"
    data-testid="category-overlap"
    class="relative z-20 -mt-40 bg-transparent pb-14 sm:-mt-48 sm:pb-16 lg:-mt-56"
  >
    <!-- Cream band starts mid-card so the top of each card sits on maroon -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 top-36 bg-amore-cream sm:top-40 lg:top-44"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto max-w-screen-2xl px-4">
      <div class="grid gap-5 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        <button
          v-for="tile in tiles"
          :key="tile.id"
          type="button"
          data-testid="category-tile"
          class="amore-category-card group relative flex min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-amore-burgundy/10 bg-[#fbf8f2] px-5 pb-5 pt-6 text-left shadow-[0_18px_40px_-20px_rgba(61,10,20,0.55)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_-18px_rgba(61,10,20,0.6)] sm:min-h-[24rem]"
          @click="nav.filterByCategory(tile.id)"
        >
          <div class="relative z-10">
            <p class="text-[10px] font-medium uppercase tracking-[0.28em] text-neutral-500">
              Categories
            </p>
            <h3 class="mt-1 font-display text-2xl text-amore-charcoal sm:text-[1.65rem]">
              {{ tile.name }}
            </h3>
          </div>

          <div class="relative z-10 mx-auto flex flex-1 items-center justify-center py-4">
            <img
              :src="tile.image"
              :alt="tile.name"
              class="max-h-44 w-auto max-w-[85%] object-contain transition duration-500 group-hover:scale-105 sm:max-h-52"
            />
          </div>

          <span
            class="relative z-10 mt-auto inline-flex w-fit items-center rounded-sm bg-amore-maroon px-3.5 py-2 text-[11px] font-medium tracking-wide text-amore-cream transition group-hover:bg-amore-burgundy"
          >
            Check More Products →
          </span>
        </button>
      </div>

      <div class="mt-10 flex justify-center">
        <button
          type="button"
          data-testid="shop-categories-view-all"
          class="text-sm font-medium text-amore-gold underline-offset-4 hover:underline"
          @click="nav.clearAndScrollToCatalogue"
        >
          View All Categories
        </button>
      </div>
    </div>
  </section>
</template>
