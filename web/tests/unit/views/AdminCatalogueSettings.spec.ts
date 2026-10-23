import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
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

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/admin/catalogue' }),
}))

const AdminCatalogueSettings = (await import('../../../src/views/admin/AdminCatalogueSettings.vue'))
  .default
const { useCollectionPageStore } = await import('../../../src/stores/collectionPage')

describe('AdminCatalogueSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const collectionPage = useCollectionPageStore()
    collectionPage.$patch({ productsPerRow: 10 })
    collectionPage.subscribeToConfig = vi.fn()
    collectionPage.saveProductsPerRow = vi.fn().mockResolvedValue(undefined)
  })

  it('saves a valid products-per-row setting', async () => {
    const collectionPage = useCollectionPageStore()
    const wrapper = mount(AdminCatalogueSettings, {
      global: { stubs: { AdminLayout: { template: '<div><slot /></div>' } } },
    })

    await wrapper.get('[data-testid="products-per-row"]').setValue('8')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(collectionPage.saveProductsPerRow).toHaveBeenCalledWith(8)
  })

  it('rejects an out-of-range row setting without saving', async () => {
    const collectionPage = useCollectionPageStore()
    const wrapper = mount(AdminCatalogueSettings, {
      global: { stubs: { AdminLayout: { template: '<div><slot /></div>' } } },
    })

    await wrapper.get('[data-testid="products-per-row"]').setValue('11')
    await wrapper.get('form').trigger('submit')

    expect(collectionPage.saveProductsPerRow).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="catalogue-settings-error"]').text()).toMatch(/1 to 10/i)
  })
})
