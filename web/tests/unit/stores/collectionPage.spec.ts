import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const upsertMock = vi.fn().mockResolvedValue({ error: null })
const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })

vi.mock('../../../src/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
      upsert: upsertMock,
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
  getCurrentUid: vi.fn().mockResolvedValue('staff-1'),
}))

const { useCollectionPageStore } = await import('../../../src/stores/collectionPage')

describe('collection page store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    upsertMock.mockClear()
    maybeSingleMock.mockResolvedValue({ data: null, error: null })
  })

  it('uses ten products per row until a saved configuration arrives', async () => {
    const store = useCollectionPageStore()
    await store.refreshConfig()
    expect(store.productsPerRow).toBe(10)
  })

  it('uses a saved row limit and persists valid admin changes', async () => {
    maybeSingleMock.mockResolvedValue({ data: { products_per_row: 6 }, error: null })
    const store = useCollectionPageStore()
    await store.refreshConfig()
    expect(store.productsPerRow).toBe(6)

    await store.saveProductsPerRow(4)
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'collection_page', products_per_row: 4 }),
    )
    expect(store.productsPerRow).toBe(4)
  })

  it('rejects out-of-range products per row', async () => {
    const store = useCollectionPageStore()
    await expect(store.saveProductsPerRow(0)).rejects.toThrow(/between/i)
    await expect(store.saveProductsPerRow(11)).rejects.toThrow(/between/i)
  })
})
