<script setup lang="ts">
import { computed, ref } from 'vue'
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
const newsletterEmail = ref('')
const newsletterNote = ref('')

function onNewsletterSubmit() {
  const value = newsletterEmail.value.trim()
  if (!value) {
    newsletterNote.value = 'Enter your email to stay in touch.'
    return
  }
  newsletterNote.value = 'Thank you — we will be in touch soon.'
  newsletterEmail.value = ''
}
</script>

<template>
  <footer class="bg-amore-maroon text-amore-cream/85">
    <div class="mx-auto max-w-screen-2xl px-4 py-14">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <router-link
            to="/"
            data-testid="footer-brand-logo"
            class="inline-flex flex-col items-start gap-3"
          >
            <img
              :src="brandLogoSrc"
              alt=""
              class="h-16 w-16 rounded-full object-cover ring-1 ring-amore-gold/40"
            />
            <span class="font-brand text-xl font-bold uppercase tracking-[0.2em] text-amore-gold">AMORE</span>
          </router-link>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-amore-cream/70">
            Handcrafted designer jewelry — bridal sets to everyday pieces, one enquiry away on WhatsApp.
          </p>
        </div>

        <div>
          <h3 class="mb-4 font-display text-lg text-amore-gold">Company</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="#about" class="transition hover:text-amore-gold">About</a></li>
            <li>
              <button type="button" class="text-left transition hover:text-amore-gold" @click="nav.filterByBridal">
                Bridal / Wedding
              </button>
            </li>
            <li><a href="#contact" class="transition hover:text-amore-gold">Contact</a></li>
            <li>
              <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="transition hover:text-amore-gold">
                WhatsApp Us
              </a>
            </li>
          </ul>

          <template v-if="catalogue.categories.length > 0">
            <h3 class="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-amore-cream/50">Categories</h3>
            <ul class="space-y-2 text-sm" data-testid="footer-categories">
              <li v-for="category in catalogue.categories" :key="category.id">
                <button
                  type="button"
                  class="text-left transition hover:text-amore-gold"
                  @click="nav.filterByCategory(category.id)"
                >
                  {{ category.name }}
                </button>
              </li>
            </ul>
          </template>
        </div>

        <div>
          <h3 class="mb-4 font-display text-lg text-amore-gold">Follow Us</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a :href="instagramLink" target="_blank" rel="noopener noreferrer" class="transition hover:text-amore-gold">
                {{ handleLabel }}
              </a>
            </li>
          </ul>

          <template v-if="catalogue.collections.length > 0">
            <h3 class="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-amore-cream/50">Collections</h3>
            <ul class="space-y-2 text-sm" data-testid="footer-collections">
              <li v-for="collectionItem in catalogue.collections" :key="collectionItem.id">
                <button
                  type="button"
                  class="text-left transition hover:text-amore-gold"
                  @click="nav.filterByCollection(collectionItem.id)"
                >
                  {{ collectionItem.name }}
                </button>
              </li>
            </ul>
          </template>

          <template v-if="catalogue.styleTags.length > 0">
            <h3 class="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-amore-cream/50">Styles</h3>
            <ul class="space-y-2 text-sm" data-testid="footer-styles">
              <li v-for="styleTag in catalogue.styleTags" :key="styleTag.id">
                <button
                  type="button"
                  class="text-left transition hover:text-amore-gold"
                  @click="nav.filterByStyleTag(styleTag.id)"
                >
                  {{ styleTag.name }}
                </button>
              </li>
            </ul>
          </template>

          <div class="mt-8">
            <h3 class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amore-cream/50">Payment Methods</h3>
            <div class="flex flex-wrap gap-2" aria-label="Accepted payment methods">
              <span
                v-for="method in ['Visa', 'Mastercard', 'UPI', 'RuPay']"
                :key="method"
                class="border border-amore-cream/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amore-cream/70"
              >
                {{ method }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="mb-4 font-display text-lg text-amore-gold">Newsletter</h3>
          <p class="mb-4 text-sm leading-relaxed text-amore-cream/70">
            Subscribe for new arrivals, bridal edits, and atelier notes.
          </p>
          <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="onNewsletterSubmit">
            <label class="sr-only" for="footer-newsletter-email">Email</label>
            <input
              id="footer-newsletter-email"
              v-model="newsletterEmail"
              type="email"
              placeholder="Your email"
              class="w-full border border-amore-cream/20 bg-amore-header px-3 py-2.5 text-sm text-amore-cream placeholder:text-amore-cream/40 focus:border-amore-gold focus:outline-none"
            />
            <button
              type="submit"
              class="shrink-0 bg-amore-gold px-5 py-2.5 text-sm font-medium tracking-wide text-amore-maroon transition hover:brightness-105"
            >
              Sign Up
            </button>
          </form>
          <p v-if="newsletterNote" class="mt-2 text-xs text-amore-gold/90">{{ newsletterNote }}</p>
        </div>
      </div>
    </div>

    <div class="border-t border-amore-cream/10 px-4 py-4 text-center text-xs text-amore-cream/50">
      &copy; {{ year }} Amore. All rights reserved.
    </div>
  </footer>
</template>
