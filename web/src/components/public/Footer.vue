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
const brandLogoSrc = '/brand/amore-logo.jpg'
</script>

<template>
  <footer class="border-t border-neutral-200 bg-amore-theme text-neutral-600">
    <div class="mx-auto max-w-screen-2xl px-4 py-12">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <div class="w-full shrink-0 lg:w-72">
          <router-link
            to="/"
            data-testid="footer-brand-logo"
            class="inline-flex flex-col items-start gap-3"
          >
            <img
              :src="brandLogoSrc"
              alt=""
              class="h-24 w-24 rounded-full object-cover ring-1 ring-amore-wordmark/40 md:h-28 md:w-28"
            />
            <span class="font-brand text-2xl font-bold uppercase tracking-wide text-amore-burgundy">AMORE</span>
          </router-link>
          <p class="mt-3 max-w-xs text-sm leading-relaxed">
            Handcrafted designer jewelry — bridal sets to everyday pieces, one enquiry away on WhatsApp.
          </p>
        </div>

        <div class="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-6">
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

          <div v-if="catalogue.collections.length > 0">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Collections</h3>
            <ul class="space-y-2 text-sm" data-testid="footer-collections">
              <li v-for="collectionItem in catalogue.collections" :key="collectionItem.id">
                <button
                  type="button"
                  class="text-left hover:text-neutral-900"
                  @click="nav.filterByCollection(collectionItem.id)"
                >
                  {{ collectionItem.name }}
                </button>
              </li>
            </ul>
          </div>

          <div v-if="catalogue.styleTags.length > 0">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Styles</h3>
            <ul class="space-y-2 text-sm" data-testid="footer-styles">
              <li v-for="styleTag in catalogue.styleTags" :key="styleTag.id">
                <button
                  type="button"
                  class="text-left hover:text-neutral-900"
                  @click="nav.filterByStyleTag(styleTag.id)"
                >
                  {{ styleTag.name }}
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
      </div>
    </div>

    <div class="border-t border-neutral-200 px-4 py-4 text-center text-xs text-neutral-400">
      &copy; {{ year }} Amore. All rights reserved.
    </div>
  </footer>
</template>
