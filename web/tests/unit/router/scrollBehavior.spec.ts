import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, type RouteLocationNormalized } from 'vue-router'

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

const { createAppRouter } = await import('../../../src/router')

function asRoute(partial: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return {
    path: '/',
    name: undefined,
    hash: '',
    query: {},
    params: {},
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...partial,
  } as RouteLocationNormalized
}

describe('router scrollBehavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('restores savedPosition when present (browser back/forward)', () => {
    const router = createAppRouter(createMemoryHistory())
    const scrollBehavior = router.options.scrollBehavior!
    const result = scrollBehavior(
      asRoute({ path: '/product/1' }),
      asRoute({ path: '/collection' }),
      { left: 0, top: 420 },
    )
    expect(result).toEqual({ left: 0, top: 420 })
  })

  it('scrolls to top when navigating without hash or saved position', () => {
    const router = createAppRouter(createMemoryHistory())
    const scrollBehavior = router.options.scrollBehavior!
    const result = scrollBehavior(asRoute({ path: '/collection' }), asRoute({ path: '/' }), null)
    expect(result).toEqual({ top: 0 })
  })

  it('applies sticky header offset for ordinary hashes', () => {
    const router = createAppRouter(createMemoryHistory())
    const scrollBehavior = router.options.scrollBehavior!
    const result = scrollBehavior(
      asRoute({ path: '/collection', hash: '#shop-by-craft' }),
      asRoute({ path: '/' }),
      null,
    )
    expect(result).toEqual({
      el: '#shop-by-craft',
      top: 112,
      behavior: 'smooth',
    })
  })

  it('adds carousel gap for product carousel hashes', () => {
    const router = createAppRouter(createMemoryHistory())
    const scrollBehavior = router.options.scrollBehavior!
    const result = scrollBehavior(
      asRoute({ path: '/', hash: '#founders-favourites-products' }),
      asRoute({ path: '/collection' }),
      null,
    )
    expect(result).toEqual({
      el: '#founders-favourites-products',
      top: 136,
      behavior: 'smooth',
    })
  })
})
