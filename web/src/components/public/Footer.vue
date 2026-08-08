<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogueNav } from '../../composables/useCatalogueNav'
import { buildGeneralEnquiryLink, buildInstagramProfileLink } from '../../composables/useWhatsAppLink'
import { useCatalogueStore } from '../../stores/catalogue'

const props = defineProps<{ instagramHandle: string; businessPhoneE164: string }>()

const catalogue = useCatalogueStore()
const nav = useCatalogueNav()

const whatsappLink = computed(() => buildGeneralEnquiryLink(props.businessPhoneE164))
const instagramLink = computed(() => buildInstagramProfileLink(props.instagramHandle))
const handleLabel = computed(() => `@${props.instagramHandle.replace(/^@/, '')}`)
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-neutral-200 bg-amore-cream text-neutral-600">
    <div class="mx-auto max-w-6xl px-4 py-12">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <p class="font-display text-2xl text-neutral-900">Amore</p>
          <p class="mt-2 max-w-xs text-sm">
            Handcrafted, designer jewelry made to be loved — bridal sets to everyday pieces, one enquiry
            away on WhatsApp.
          </p>
        </div>

        <div>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Explore</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="#about" class="hover:text-neutral-900">About</a></li>
            <li>
              <button type="button" class="text-left hover:text-neutral-900" @click="nav.filterByBridal">
                Bridal/Wedding
              </button>
            </li>
            <li><a href="#contact" class="hover:text-neutral-900">Contact</a></li>
          </ul>
        </div>

        <div v-if="catalogue.categories.length > 0">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Categories</h3>
          <ul class="space-y-2 text-sm" data-testid="footer-categories">
            <li v-for="category in catalogue.categories" :key="category.id">
              <button
                type="button"
                class="text-left hover:text-neutral-900"
                @click="nav.filterByCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Get in Touch</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="hover:text-neutral-900">
                WhatsApp Us
              </a>
            </li>
            <li>
              <a :href="instagramLink" target="_blank" rel="noopener noreferrer" class="hover:text-neutral-900">
                {{ handleLabel }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        v-if="catalogue.collections.length > 0 || catalogue.styleTags.length > 0"
        class="mt-10 border-t border-neutral-200 pt-6 text-xs"
      >
        <p v-if="catalogue.collections.length > 0" class="mb-2" data-testid="footer-collections">
          <span class="font-medium text-neutral-500">Collections: </span>
          <template v-for="(collectionItem, index) in catalogue.collections" :key="collectionItem.id">
            <button
              type="button"
              class="hover:text-neutral-900 hover:underline"
              @click="nav.filterByCollection(collectionItem.id)"
            >
              {{ collectionItem.name }}
            </button>
            <span v-if="index < catalogue.collections.length - 1"> | </span>
          </template>
        </p>
        <p v-if="catalogue.styleTags.length > 0" data-testid="footer-styles">
          <span class="font-medium text-neutral-500">Styles: </span>
          <template v-for="(styleTag, index) in catalogue.styleTags" :key="styleTag.id">
            <button
              type="button"
              class="hover:text-neutral-900 hover:underline"
              @click="nav.filterByStyleTag(styleTag.id)"
            >
              {{ styleTag.name }}
            </button>
            <span v-if="index < catalogue.styleTags.length - 1"> | </span>
          </template>
        </p>
      </div>
    </div>

    <div class="border-t border-neutral-200 px-4 py-4 text-center text-xs text-neutral-400">
      &copy; {{ year }} Amore. All rights reserved.
    </div>
  </footer>
</template>
