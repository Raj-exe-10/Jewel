import { createRouter, createWebHistory, type RouterHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
    path: '/admin/homepage',
    name: 'admin-homepage',
    component: () => import('../views/admin/AdminHomepage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('../views/admin/AdminProductList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/taxonomies',
    name: 'admin-taxonomies',
    component: () => import('../views/admin/AdminTaxonomies.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    redirect: '/admin/homepage',
  },
]

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
