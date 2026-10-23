import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product, ProductInput } from '../../../src/types/catalogue'

const insertMock = vi.fn()
const updateMock = vi.fn()
const deleteMock = vi.fn()
const styleDeleteMock = vi.fn()
const styleInsertMock = vi.fn()

function chain(terminal: unknown) {
  const api: Record<string, unknown> = {}
  api.select = vi.fn(() => api)
  api.insert = vi.fn((payload: unknown) => {
    insertMock(payload)
    return api
  })
  api.update = vi.fn((payload: unknown) => {
    updateMock(payload)
    return api
  })
  api.delete = vi.fn(() => {
    deleteMock()
    return api
  })
  api.eq = vi.fn(() => api)
  api.single = vi.fn(async () => terminal)
  return api
}

vi.mock('../../../src/supabase/client', () => ({
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'product_style_tags') {
        return {
          delete: vi.fn(() => {
            styleDeleteMock()
            return { eq: vi.fn().mockResolvedValue({ error: null }) }
          }),
          insert: vi.fn((rows: unknown) => {
            styleInsertMock(rows)
            return Promise.resolve({ error: null })
          }),
        }
      }
      if (table === 'products') {
        return {
          insert: (payload: unknown) => {
            insertMock(payload)
            return {
              select: () => ({
                single: async () => ({ data: { id: 'new-product-id' }, error: null }),
              }),
            }
          },
          update: (payload: unknown) => {
            updateMock(payload)
            return { eq: async () => ({ error: null }) }
          },
          delete: () => {
            deleteMock()
            return { eq: async () => ({ error: null }) }
          },
        }
      }
      return chain({ data: null, error: null })
    }),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })),
    getChannels: vi.fn(() => []),
    removeChannel: vi.fn(),
  },
}))

const { useCatalogueStore } = await import('../../../src/stores/catalogue')

const input: ProductInput = {
  name: 'QA Piece',
  priceInr: 500,
  description: 'desc',
  photoUrls: ['https://example.com/a.jpg'],
  media: [{ id: 'm1', kind: 'image', url: 'https://example.com/a.jpg', sortOrder: 0 }],
  categoryId: 'cat-1',
  styleTagIds: ['tag-1', 'tag-2'],
  collectionId: null,
  isNewArrival: false,
  isFounderFavourite: false,
  isStatementPick: false,
  isBridal: false,
  styleGroup: null,
}

describe('catalogue store write paths', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    insertMock.mockClear()
    updateMock.mockClear()
    deleteMock.mockClear()
    styleDeleteMock.mockClear()
    styleInsertMock.mockClear()
  })

  it('saveProduct creates a row and replaces style tags', async () => {
    const store = useCatalogueStore()
    const id = await store.saveProduct(input)
    expect(id).toBe('new-product-id')
    expect(insertMock).toHaveBeenCalled()
    expect(styleDeleteMock).toHaveBeenCalled()
    expect(styleInsertMock).toHaveBeenCalledWith([
      { product_id: 'new-product-id', style_tag_id: 'tag-1' },
      { product_id: 'new-product-id', style_tag_id: 'tag-2' },
    ])
  })

  it('saveProduct updates an existing id', async () => {
    const store = useCatalogueStore()
    const id = await store.saveProduct(input, 'existing-id')
    expect(id).toBe('existing-id')
    expect(updateMock).toHaveBeenCalled()
    expect(styleInsertMock).toHaveBeenCalled()
  })

  it('deleteProduct deletes by id', async () => {
    const store = useCatalogueStore()
    await store.deleteProduct('p1')
    expect(deleteMock).toHaveBeenCalled()
  })

  it('isTaxonomyReferenced and removeTaxonomyEntry guard referenced ids', async () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [
        {
          id: 'p1',
          categoryId: 'cat-1',
          collectionId: 'col-1',
          styleTagIds: ['tag-1'],
        } as Product,
      ],
      categories: [{ id: 'cat-1', name: 'Necklace', sortOrder: 0, createdAt: 0 }],
      collections: [{ id: 'col-1', name: 'Jadau', sortOrder: 0, createdAt: 0 }],
      styleTags: [{ id: 'tag-1', name: 'Bridal', sortOrder: 0, createdAt: 0 }],
    })

    expect(store.isTaxonomyReferenced('categories', 'cat-1')).toBe(true)
    expect(store.isTaxonomyReferenced('collections', 'col-1')).toBe(true)
    expect(store.isTaxonomyReferenced('styleTags', 'tag-1')).toBe(true)
    await expect(store.removeTaxonomyEntry('categories', 'cat-1')).rejects.toThrow(/referenced/i)
    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('removeTaxonomyEntry deletes unreferenced entries', async () => {
    const store = useCatalogueStore()
    store.$patch({
      products: [],
      categories: [{ id: 'cat-free', name: 'Free', sortOrder: 0, createdAt: 0 }],
    })
    await store.removeTaxonomyEntry('categories', 'cat-free')
    expect(deleteMock).toHaveBeenCalled()
  })
})
