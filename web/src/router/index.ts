import { createRouter, createWebHistory, type RouterHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'public-home',
    component: () => import('../views/PublicHome.vue'),
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('../views/ProductDetail.vue'),
  },
  {
    path: '/collection',
    name: 'collection',
    component: () => import('../views/CollectionPage.vue'),
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
    path: '/admin/business',
    name: 'admin-business',
    component: () => import('../views/admin/AdminBusiness.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/catalogue',
    name: 'admin-catalogue-settings',
    component: () => import('../views/admin/AdminCatalogueSettings.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    redirect: '/admin/homepage',
  },
]

/** Sticky promo + header clearance — matches `scroll-mt-28` (~7rem). */
const STICKY_HEADER_OFFSET = 112
/** Extra gap for homepage product carousels — matches `scroll-mt-36` vs `scroll-mt-28`. */
const PRODUCT_CAROUSEL_GAP = 24
const PRODUCT_CAROUSEL_HASHES = new Set([
  '#shop-the-visuals-products',
  '#founders-favourites-products',
])

function scrollTopForHash(hash: string): number {
  return STICKY_HEADER_OFFSET + (PRODUCT_CAROUSEL_HASHES.has(hash) ? PRODUCT_CAROUSEL_GAP : 0)
}

export function createAppRouter(history: RouterHistory) {
  const appRouter = createRouter({
    history,
    routes,
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) {
        return {
          el: to.hash,
          top: scrollTopForHash(to.hash),
          behavior: 'smooth',
        }
      }
      return { top: 0 }
    },
  })

  appRouter.beforeEach(async (to) => {
    const auth = useAuthStore()
    await auth.ensureReady()
    if (to.meta.requiresAuth && !auth.currentUser) {
      return { path: '/admin/login' }
    }
    return true
  })


  return appRouter
}

export const router = createAppRouter(createWebHistory())
