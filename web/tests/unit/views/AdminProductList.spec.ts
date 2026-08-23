import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../src/types/catalogue'

vi.mock('../../../src/firebase/config', () => ({ db: {}, storage: {}, auth: { currentUser: { uid: 'staff-1' } } }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/admin/products' }),
}))

const AdminProductList = (await import('../../../src/views/admin/AdminProductList.vue')).default
const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const { useAuthStore } = await import('../../../src/stores/auth')
const { useHomepageStore } = await import('../../../src/stores/homepage')

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Kundan Choker',
    priceInr: 5000,
    description: 'A lovely necklace',
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

describe('AdminProductList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.$patch({ currentUser: { uid: 'staff-1', email: 'owner@amore.test' } as never })

    const catalogue = useCatalogueStore()
    catalogue.$patch({
      products: [
        makeProduct({ id: 'p1', name: 'Product Alpha' }),
        makeProduct({ id: 'p2', name: 'Product Beta' }),
      ],
      categories: [{ id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }],
    })
    catalogue.subscribeToCatalogue = vi.fn()
    const homepage = useHomepageStore()
    homepage.subscribeToSections = vi.fn()
    homepage.scrubProductFromSections = vi.fn().mockResolvedValue(undefined)
    homepage.$patch({ sections: [] })
  })

  function mountPage(options?: { realConfirm?: boolean }) {
    return mount(AdminProductList, {
      global: {
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          ConfirmDeleteDialog: options?.realConfirm
            ? false
            : true,
          ProductForm: {
            props: ['editing'],
            emits: ['saved'],
            template:
              '<form data-testid="product-form"><p data-testid="editing-name">{{ editing?.name ?? "new" }}</p></form>',
          },
        },
      },
      attachTo: document.body,
    })
  }

  it('warns about homepage dependencies before delete', async () => {
    const homepage = useHomepageStore()
    homepage.$patch({
      sections: [
        {
          id: 's1',
          type: 'product_carousel',
          title: 'Hand picks',
          anchorId: 'hp',
          sortOrder: 0,
          isVisible: true,
          createdAt: 0,
          updatedAt: 0,
          updatedBy: 'u',
          productSelectionMode: 'manual',
          productIds: ['p1'],
          content: { variant: 'carousel' },
        },
      ],
    })
    const wrapper = mountPage({ realConfirm: true })
    await wrapper.get('[data-testid="delete-product-p1"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="delete-dependency-warning"]').text()).toMatch(/Hand picks/)
  })

  it('opens the product form in a modal when Edit is clicked', async () => {
    const wrapper = mountPage()
    expect(wrapper.find('[data-testid="product-form-modal"]').exists()).toBe(false)

    await wrapper.get('[data-testid="edit-product-p1"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="product-form-modal"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="editing-name"]').text()).toBe('Product Alpha')
  })

  it('switches the modal form to another product when a different Edit is clicked', async () => {
    const wrapper = mountPage()

    await wrapper.get('[data-testid="edit-product-p1"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="editing-name"]').text()).toBe('Product Alpha')

    await wrapper.get('[data-testid="edit-product-p2"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="editing-name"]').text()).toBe('Product Beta')
  })

  it('opens the modal for a new product from Add Product', async () => {
    const wrapper = mountPage()
    await wrapper.get('[data-testid="add-product-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="product-form-modal"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="editing-name"]').text()).toBe('new')
  })
})
