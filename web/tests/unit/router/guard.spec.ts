import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn().mockResolvedValue(undefined),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
  splitFolder: vi.fn((folder) => {
    const parts = String(folder).split('/').filter(Boolean)
    return { bucket: parts[0] ?? 'product-photos', prefix: parts.slice(1).join('/') }
  }),
  publicObjectUrl: vi.fn(() => 'https://example.com/file'),
  parsePublicUrl: vi.fn(),
}))

import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'

// Router import chain pulls in stores/auth -> supabase/config, which would
// otherwise try to initialize a real Supabase app during this pure
// routing-logic test. Mocked the same way as tests/unit/stores/auth.spec.ts.
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
  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    // Mirror production: ensureReady is a no-op once initialized in unit tests.
    if (typeof auth.ensureReady === 'function') await auth.ensureReady()
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
    // Mark auth ready so ensureReady does not re-hydrate a null mock session over the patch.
    auth.$patch({
      currentUser: { uid: 'abc123', email: 'owner@amore.test' },
      initialized: true,
      ready: Promise.resolve(),
    })

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
