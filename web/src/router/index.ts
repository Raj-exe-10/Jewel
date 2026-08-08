import { createRouter, createWebHistory, type RouterHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// FR-022 / Constitution Principle III: the public storefront is a single
// page ("/"); only the manager panel gets its own protected route group.
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'public-home',
    component: () => import('../views/PublicHome.vue'),
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/AdminLogin.vue'),
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('../views/admin/AdminProductList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    redirect: '/admin/products',
  },
]

/**
 * Builds a router with the auth guard applied, parameterized by history mode
 * so tests can pass `createMemoryHistory()` instead of the real browser one.
 */
export function createAppRouter(history: RouterHistory) {
  const appRouter = createRouter({ history, routes })

  appRouter.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.currentUser) {
      return { path: '/admin/login' }
    }
    return true
  })

  return appRouter
}

export const router = createAppRouter(createWebHistory())
