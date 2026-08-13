<script setup lang="ts">
import { computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { buildProductEnquiryLink, buildWishlistEnquiryLink } from '../../composables/useWhatsAppLink'
import { jewelryImageFor } from '../../data/storefrontMedia'
import { useCatalogueStore } from '../../stores/catalogue'
import { useWishlistStore } from '../../stores/wishlist'
import WhatsAppIcon from './WhatsAppIcon.vue'

const props = defineProps<{
  open: boolean
  businessPhoneE164: string
}>()

const emit = defineEmits<{ close: [] }>()

const catalogue = useCatalogueStore()
const wishlist = useWishlistStore()

const wishlistedProducts = computed(() =>
  catalogue.products.filter((product) => wishlist.productIds.includes(product.id)),
)

const enquireAllLink = computed(() =>
  buildWishlistEnquiryLink(wishlistedProducts.value, props.businessPhoneE164),
)

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? ''
}

function photoFor(product: { photoUrls: string[]; name: string; categoryId: string }) {
  const url = product.photoUrls[0]
  if (!url || url.includes('picsum.photos')) {
    return jewelryImageFor(categoryNameFor(product.categoryId) || product.name)
  }
  return url
}

function enquiryLinkFor(productId: string) {
  const product = catalogue.products.find((p) => p.id === productId)
  if (!product) return '#'
  return buildProductEnquiryLink(product, props.businessPhoneE164)
}

function remove(productId: string) {
  wishlist.toggle(productId)
}

function clearAll() {
  wishlist.clear()
}

function goToProduct(productId: string) {
  emit('close')
  // Wait a tick so the drawer closes before scrolling.
  requestAnimationFrame(() => {
    document.getElementById(`product-${productId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex justify-end" data-testid="wishlist-drawer">
        <button
          type="button"
          class="absolute inset-0 bg-black/40"
          aria-label="Close wishlist"
          data-testid="wishlist-drawer-backdrop"
          @click="emit('close')"
        />
        <aside class="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div class="flex items-center gap-2">
              <HeartSolidIcon class="h-5 w-5 text-amore-gold" />
              <h2 class="font-display text-xl text-amore-charcoal">Your Wishlist</h2>
            </div>
            <button
              type="button"
              data-testid="wishlist-drawer-close"
              aria-label="Close wishlist"
              class="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100"
              @click="emit('close')"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4">
            <p v-if="wishlistedProducts.length === 0" data-testid="wishlist-empty" class="py-16 text-center text-sm text-neutral-500">
              No favourites yet. Tap the heart on any piece to save it here.
            </p>

            <ul v-else class="space-y-4">
              <li
                v-for="product in wishlistedProducts"
                :key="product.id"
                data-testid="wishlist-item"
                class="flex gap-3 border-b border-neutral-100 pb-4"
              >
                <button
                  type="button"
                  class="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md"
                  data-testid="wishlist-item-open"
                  @click="goToProduct(product.id)"
                >
                  <img
                    :src="photoFor(product)"
                    :alt="product.name"
                    class="h-full w-full object-cover transition hover:opacity-90"
                  />
                </button>
                <div class="flex min-w-0 flex-1 flex-col">
                  <p class="text-[10px] uppercase tracking-wide text-neutral-500">
                    {{ categoryNameFor(product.categoryId) }}
                  </p>
                  <button
                    type="button"
                    class="truncate text-left font-display text-base text-neutral-900 hover:text-amore-gold"
                    data-testid="wishlist-item-name"
                    @click="goToProduct(product.id)"
                  >
                    {{ product.name }}
                  </button>
                  <p class="mt-0.5 text-sm font-medium">₹{{ product.priceInr.toLocaleString('en-IN') }}</p>
                  <div class="mt-auto flex items-center gap-3 pt-2">
                    <a
                      :href="enquiryLinkFor(product.id)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs font-medium text-whatsapp underline-offset-2 hover:underline"
                    >
                      Enquire
                    </a>
                    <button
                      type="button"
                      data-testid="wishlist-remove"
                      class="text-xs text-neutral-500 hover:text-neutral-900"
                      @click="remove(product.id)"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div
            v-if="wishlistedProducts.length > 0"
            class="space-y-2 border-t border-neutral-200 px-5 py-4"
          >
            <a
              :href="enquireAllLink"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="wishlist-enquire-all"
              class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-4 py-2.5 text-sm font-medium text-white transition hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon />
              Enquire about all
            </a>
            <button
              type="button"
              data-testid="wishlist-clear"
              class="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              @click="clearAll"
            >
              Clear wishlist
            </button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
