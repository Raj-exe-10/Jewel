<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const links = [
  { to: '/admin/homepage', label: 'Homepage', testid: 'nav-homepage' },
  { to: '/admin/products', label: 'Products', testid: 'nav-products' },
  { to: '/admin/taxonomies', label: 'Taxonomies', testid: 'nav-taxonomies' },
  { to: '/admin/catalogue', label: 'Catalogue', testid: 'nav-catalogue' },
  { to: '/admin/business', label: 'Business', testid: 'nav-business' },
]

async function onLogout() {
  await auth.logout()
  router.push('/admin/login')
}

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <div class="min-h-screen bg-amore-cream">
    <header class="sticky top-0 z-40 border-b border-amore-gold/30 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <p class="font-display text-2xl text-amore-gold">Amore</p>
          <p class="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Manager</p>
        </div>
        <nav class="hidden items-center gap-6 sm:flex">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :data-testid="link.testid"
            class="text-sm font-medium tracking-wide transition"
            :class="
              isActive(link.to) ? 'text-amore-gold' : 'text-neutral-700 hover:text-amore-charcoal'
            "
          >
            {{ link.label }}
          </router-link>
        </nav>
        <div class="flex items-center gap-3">
          <p v-if="auth.currentUser" class="hidden text-xs text-neutral-500 sm:block">
            {{ auth.currentUser.email }}
          </p>
          <button
            type="button"
            data-testid="logout-button"
            class="rounded-full border border-neutral-300 px-4 py-2 text-sm"
            @click="onLogout"
          >
            Log out
          </button>
        </div>
      </div>
      <nav class="flex gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 sm:hidden">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :data-testid="`${link.testid}-mobile`"
          class="whitespace-nowrap text-sm font-medium"
          :class="isActive(link.to) ? 'text-amore-gold' : 'text-neutral-700'"
        >
          {{ link.label }}
        </router-link>
      </nav>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
