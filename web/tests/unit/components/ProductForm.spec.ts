import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '../../../src/types/catalogue'

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    from: vi.fn(),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })),
    removeChannel: vi.fn(),
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

vi.mock('../../../src/supabase/storage', () => ({
  uploadPublicFile: vi.fn().mockResolvedValue('https://example.com/file'),
  deletePublicUrl: vi.fn(),
  isManagedStorageUrl: vi.fn().mockReturnValue(true),
}))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')
const ProductForm = (await import('../../../src/components/admin/ProductForm.vue')).default

const ProductMediaUploaderStub = {
  name: 'ProductMediaUploader',
  props: ['modelValue', 'productId'],
  emits: ['update:modelValue'],
  template: '<div data-testid="media-uploader-stub" />',
}

const category: Category = { id: 'cat-necklace', name: 'Necklace', sortOrder: 0, createdAt: 0 }

describe('ProductForm', () => {
  const saveProductMock = vi.fn().mockResolvedValue('new-id')

  beforeEach(() => {
    setActivePinia(createPinia())
    saveProductMock.mockClear()
    saveProductMock.mockResolvedValue('new-id')
  })

  function mountForm() {
    const store = useCatalogueStore()
    store.$patch({ categories: [category] })
    store.saveProduct = saveProductMock
    const wrapper = mount(ProductForm, {
      global: { stubs: { ProductMediaUploader: ProductMediaUploaderStub } },
    })
    return { wrapper, store }
  }

  it('blocks save when name is empty', async () => {
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-price"]').setValue(1000)
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('form').trigger('submit.prevent')

    expect(saveProductMock).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="form-error"]').text().length).toBeGreaterThan(0)
  })

  it('blocks save when price is negative', async () => {
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-name"]').setValue('Test Product')
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('[data-testid="product-price"]').setValue(-5)
    await wrapper.findComponent(ProductMediaUploaderStub).vm.$emit('update:modelValue', [
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
    ])
    await wrapper.get('form').trigger('submit.prevent')

    expect(saveProductMock).not.toHaveBeenCalled()
  })

  it('blocks save when there are zero photos', async () => {
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-name"]').setValue('Test Product')
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('[data-testid="product-price"]').setValue(1000)
    await wrapper.get('form').trigger('submit.prevent')

    expect(saveProductMock).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="form-error"]').text()).toMatch(/photo|video|media/i)
  })

  it('saves successfully once name, description, price, category, and a photo are all present', async () => {
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-name"]').setValue('Test Product')
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('[data-testid="product-price"]').setValue(1000)
    await wrapper.findComponent(ProductMediaUploaderStub).vm.$emit('update:modelValue', [
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
    ])
    await wrapper.get('form').trigger('submit.prevent')

    expect(saveProductMock).toHaveBeenCalledTimes(1)
    const payload = saveProductMock.mock.calls[0]![0] as {
      isFounderFavourite: boolean
      isBridal: boolean
    }
    expect(payload.isFounderFavourite).toBe(false)
    expect(payload.isBridal).toBe(false)
  })

  it('saves curated-section flags when they are checked', async () => {
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-name"]').setValue('Test Product')
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('[data-testid="product-price"]').setValue(1000)
    await wrapper.findComponent(ProductMediaUploaderStub).vm.$emit('update:modelValue', [
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
    ])
    await wrapper.get('[data-testid="flag-founder"]').setValue(true)
    await wrapper.get('[data-testid="flag-bridal"]').setValue(true)
    await wrapper.get('form').trigger('submit.prevent')

    const payload = saveProductMock.mock.calls[0]![0] as {
      isFounderFavourite: boolean
      isBridal: boolean
    }
    expect(payload.isFounderFavourite).toBe(true)
    expect(payload.isBridal).toBe(true)
  })

  it('UI-NEG-02: double submit while saving calls saveProduct once', async () => {
    let resolveSave!: (id: string) => void
    saveProductMock.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveSave = resolve
        }),
    )
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-name"]').setValue('Test Product')
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('[data-testid="product-price"]').setValue(1000)
    await wrapper.findComponent(ProductMediaUploaderStub).vm.$emit('update:modelValue', [
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
    ])

    const first = wrapper.get('form').trigger('submit.prevent')
    const second = wrapper.get('form').trigger('submit.prevent')
    expect(saveProductMock).toHaveBeenCalledTimes(1)
    resolveSave('new-id')
    await Promise.all([first, second])
    expect(saveProductMock).toHaveBeenCalledTimes(1)
  })

  it('shows a friendly error when saveProduct rejects (network)', async () => {
    saveProductMock.mockRejectedValue(new Error('Failed to fetch'))
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-name"]').setValue('Test Product')
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('[data-testid="product-price"]').setValue(1000)
    await wrapper.findComponent(ProductMediaUploaderStub).vm.$emit('update:modelValue', [
      { id: 'i1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 },
    ])
    await wrapper.get('form').trigger('submit.prevent')
    expect(wrapper.get('[data-testid="form-error"]').text()).toMatch(/connection|try again/i)
  })
})
