<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

async function onSubmit() {
  await auth.login(email.value, password.value)
  if (auth.currentUser) {
    await router.push('/admin/products')
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-amore-cream px-4">
    <form class="w-full max-w-sm rounded-lg bg-white p-8 shadow" @submit.prevent="onSubmit">
      <h1 class="mb-6 font-display text-2xl text-neutral-900">Amore Manager Login</h1>

      <label class="mb-4 block text-sm">
        <span class="mb-1 block text-neutral-700">Email</span>
        <input
          v-model="email"
          type="email"
          required
          class="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>

      <label class="mb-4 block text-sm">
        <span class="mb-1 block text-neutral-700">Password</span>
        <input
          v-model="password"
          type="password"
          required
          class="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>

      <p v-if="auth.errorMessage" data-testid="login-error" class="mb-4 text-sm text-red-600">
        {{ auth.errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="auth.isLoading"
        class="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {{ auth.isLoading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </main>
</template>
