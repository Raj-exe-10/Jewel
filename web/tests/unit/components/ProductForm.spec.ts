import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '../../../src/types/catalogue'

const { addDocMock, setDocMock } = vi.hoisted(() => ({
  addDocMock: vi.fn().mockResolvedValue({ id: 'new-id' }),
  setDocMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../src/firebase/config', () => ({ db: {}, auth: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: addDocMock,
  setDoc: setDocMock,
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: () => 0,
}))
vi.mock('firebase/auth', () => ({ onAuthStateChanged: vi.fn() }))

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
  beforeEach(() => {
    setActivePinia(createPinia())
    addDocMock.mockClear()
  })

  function mountForm() {
    const store = useCatalogueStore()
    store.$patch({ categories: [category] })
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

    expect(addDocMock).not.toHaveBeenCalled()
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

    expect(addDocMock).not.toHaveBeenCalled()
  })

  it('blocks save when there are zero photos', async () => {
    const { wrapper } = mountForm()
    await wrapper.get('[data-testid="product-name"]').setValue('Test Product')
    await wrapper.get('[data-testid="product-description"]').setValue('desc')
    await wrapper.get('[data-testid="product-price"]').setValue(1000)
    await wrapper.get('form').trigger('submit.prevent')

    expect(addDocMock).not.toHaveBeenCalled()
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

    expect(addDocMock).toHaveBeenCalledTimes(1)
    const payload = addDocMock.mock.calls[0][1] as { isFounderFavourite: boolean; isBridal: boolean }
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

    const payload = addDocMock.mock.calls[0][1] as { isFounderFavourite: boolean; isBridal: boolean }
    expect(payload.isFounderFavourite).toBe(true)
    expect(payload.isBridal).toBe(true)
  })
})
