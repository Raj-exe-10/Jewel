import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
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

import type { Product } from '../../../src/types/catalogue'

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useWishlistStore } = await import('../../../src/stores/wishlist')
const WishlistDrawer = (await import('../../../src/components/public/WishlistDrawer.vue')).default

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Kundan Choker',
    priceInr: 5000,
    description: 'desc',
    photoUrls: ['https://example.com/photo.jpg'],
    categoryId: 'cat-necklace',
    styleTagIds: [],
    collectionId: null,
    isNewArrival: false,
    isFounderFavourite: false,
    isStatementPick: false,
    isBridal: false,
    styleGroup: null,
    createdAt: 0,
    updatedAt: 0,
    createdBy: 'uid1',
    updatedBy: 'uid1',
    ...overrides,
  }
}

describe('WishlistDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    mount(WishlistDrawer, {
      props: { open: false, businessPhoneE164: '919999999999' },
      attachTo: document.body,
    })
    expect(document.querySelector('[data-testid="wishlist-drawer"]')).toBeNull()
  })

  it('shows an empty state when open with no wishlisted products', () => {
    const wrapper = mount(WishlistDrawer, {
      props: { open: true, businessPhoneE164: '919999999999' },
      attachTo: document.body,
    })
    expect(document.querySelector('[data-testid="wishlist-empty"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('lists wishlisted products and can remove them', async () => {
    const catalogue = useCatalogueStore()
    const wishlist = useWishlistStore()
    catalogue.$patch({
      categories: [{ id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }],
      products: [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2', name: 'Other' })],
    })
    wishlist.toggle('p1')

    const wrapper = mount(WishlistDrawer, {
      props: { open: true, businessPhoneE164: '919999999999' },
      attachTo: document.body,
    })

    expect(document.querySelectorAll('[data-testid="wishlist-item"]')).toHaveLength(1)
    expect(document.body.textContent).toContain('Kundan Choker')

    const removeBtn = document.querySelector('[data-testid="wishlist-remove"]') as HTMLButtonElement
    removeBtn.click()
    await wrapper.vm.$nextTick()

    expect(wishlist.productIds).not.toContain('p1')
    wrapper.unmount()
  })

  it('exposes enquire-all and clear-wishlist actions', async () => {
    const catalogue = useCatalogueStore()
    const wishlist = useWishlistStore()
    catalogue.$patch({
      products: [makeProduct({ id: 'p1' }), makeProduct({ id: 'p2', name: 'Polki Ring' })],
    })
    wishlist.toggle('p1')
    wishlist.toggle('p2')

    const wrapper = mount(WishlistDrawer, {
      props: { open: true, businessPhoneE164: '919999999999' },
      attachTo: document.body,
    })

    const enquireAll = document.querySelector('[data-testid="wishlist-enquire-all"]') as HTMLAnchorElement
    expect(enquireAll).not.toBeNull()
    expect(decodeURIComponent(enquireAll.href)).toContain('Kundan Choker')
    expect(decodeURIComponent(enquireAll.href)).toContain('Polki Ring')

    ;(document.querySelector('[data-testid="wishlist-clear"]') as HTMLButtonElement).click()
    await wrapper.vm.$nextTick()
    expect(wishlist.productIds).toEqual([])
    wrapper.unmount()
  })

  it('scrolls to the product card when a wishlist item is clicked', async () => {
    const catalogue = useCatalogueStore()
    const wishlist = useWishlistStore()
    catalogue.$patch({ products: [makeProduct({ id: 'p1' })] })
    wishlist.toggle('p1')

    const target = document.createElement('div')
    target.id = 'product-p1'
    target.scrollIntoView = vi.fn()
    document.body.appendChild(target)

    const wrapper = mount(WishlistDrawer, {
      props: { open: true, businessPhoneE164: '919999999999' },
      attachTo: document.body,
    })

    ;(document.querySelector('[data-testid="wishlist-item-name"]') as HTMLButtonElement).click()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(target.scrollIntoView).toHaveBeenCalled()
    wrapper.unmount()
    target.remove()
  })
})
