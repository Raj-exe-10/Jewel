import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/firebase/config', () => ({
  db: {},
  auth: { currentUser: { uid: 'staff-1' } },
}))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  setDoc: vi.fn(),
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
