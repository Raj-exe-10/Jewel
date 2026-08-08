<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function onLogout() {
  await auth.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <header class="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <div>
        <p class="font-display text-xl text-neutral-900">Amore Manager</p>
        <p v-if="auth.currentUser" class="text-xs text-neutral-500">{{ auth.currentUser.email }}</p>
      </div>
      <button
        type="button"
        data-testid="logout-button"
        class="rounded-md border border-neutral-300 px-4 py-2 text-sm"
        @click="onLogout"
      >
        Log out
      </button>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
