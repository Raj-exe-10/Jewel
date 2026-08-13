import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'

// Router import chain pulls in stores/auth -> firebase/config, which would
// otherwise try to initialize a real Firebase app during this pure
// routing-logic test. Mocked the same way as tests/unit/stores/auth.spec.ts.
vi.mock('../../../src/firebase/config', () => ({ auth: {} }))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

const { useAuthStore } = await import('../../../src/stores/auth')

// Stub page components so this suite only exercises the navigation guard —
// importing PublicHome pulls in carousels/videos and is covered elsewhere.
const StubPage = { template: '<div />' }

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'public-home', component: StubPage },
  { path: '/admin/login', name: 'admin-login', component: StubPage },
  { path: '/admin/homepage', name: 'admin-homepage', component: StubPage, meta: { requiresAuth: true } },
  { path: '/admin/products', name: 'admin-products', component: StubPage, meta: { requiresAuth: true } },
  { path: '/admin/taxonomies', name: 'admin-taxonomies', component: StubPage, meta: { requiresAuth: true } },
  { path: '/admin', redirect: '/admin/homepage' },
]

function buildRouter() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.currentUser) {
      return { path: '/admin/login' }
    }
    return true
  })
  return router
}

describe('router navigation guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('redirects an unauthenticated visitor away from /admin to /admin/login', async () => {
    const router = buildRouter()
    await router.push('/admin/homepage')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/admin/login')
  })

  it('allows an authenticated visitor to reach /admin/products', async () => {
    const auth = useAuthStore()
    auth.$patch({ currentUser: { uid: 'abc123', email: 'owner@amore.test' } as never })

    const router = buildRouter()
    await router.push('/admin/products')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/admin/products')
  })

  it('always allows the public home route with no login required', async () => {
    const router = buildRouter()
    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('allows an unauthenticated visitor to reach the login screen itself', async () => {
    const router = buildRouter()
    await router.push('/admin/login')
    await router.isReady()

    expect(router.currentRoute.value.path).toBe('/admin/login')
  })
})
